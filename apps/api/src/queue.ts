import { QueueMessageSchema, type QueueMessage } from '@pentegra/shared';
import type { Env } from './types';
import { upsertOrder, insertOrderEvent } from './services/orders';
import { getOutboundCreds } from './services/integrations';
import { migrosPostEncrypted } from './adapters/migros';
import { getirApproveOrder } from './adapters/getir';

const RAW_JSON_LIMIT = 10000;

export async function handleQueueMessage(env: Env, payload: unknown): Promise<void> {
  const parsed = QueueMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  if (parsed.data.type === 'ORDER_INGEST') {
    await handleOrderIngest(env, parsed.data);
    return;
  }

  if (parsed.data.type === 'ORDER_AUTO_APPROVE') {
    await handleAutoApprove(env, parsed.data);
    return;
  }

  if (parsed.data.type === 'ORDER_AUTO_ASSIGN') {
    await handleAutoAssign(env, parsed.data);
  }
}

async function handleOrderIngest(env: Env, msg: Extract<QueueMessage, { type: 'ORDER_INGEST' }>): Promise<void> {
  const now = new Date().toISOString();
  let platformOrderId = '';
  let status = 'RECEIVED';
  let deliveryProvider: string | undefined;

  if (msg.platform === 'migros') {
    if (msg.eventType === 'orderCreated') {
      const body = msg.payload as any;
      platformOrderId = body.id;
      status = body.status ?? 'NEW_PENDING';
      deliveryProvider = body.deliveryProvider ?? null;
    } else if (msg.eventType === 'orderCanceled') {
      const body = msg.payload as any;
      platformOrderId = body.OrderId;
      status = 'CANCELLED';
    } else if (msg.eventType === 'deliveryStatusChanged') {
      const body = msg.payload as any;
      platformOrderId = body.orderId;
      status = body.deliveryStatus ?? 'DELIVERY';
    }
  }

  if (msg.platform === 'getir') {
    const body = msg.payload as any;
    platformOrderId = body.id;
    status = msg.eventType === 'cancelOrder' ? 'CANCELLED' : 'RECEIVED';
  }

  if (!platformOrderId) {
    return;
  }

  const existing = await env.DB.prepare(
    'SELECT id, created_at FROM orders WHERE platform = ? AND platform_order_id = ?'
  )
    .bind(msg.platform, platformOrderId)
    .first<{ id: string; created_at: string }>();
  const orderId = existing?.id ?? crypto.randomUUID();
  const createdAt = existing?.created_at ?? now;
  const rawJson = JSON.stringify(msg.payload).slice(0, RAW_JSON_LIMIT);

  await upsertOrder(env.DB, {
    id: orderId,
    tenant_id: msg.tenantId,
    restaurant_id: msg.restaurantId,
    platform: msg.platform,
    platform_order_id: platformOrderId,
    status,
    delivery_provider: deliveryProvider,
    created_at: createdAt,
    updated_at: now,
    raw_json: rawJson
  });

  await insertOrderEvent(env.DB, {
    id: crypto.randomUUID(),
    order_id: orderId,
    type: 'WEBHOOK_RECEIVED',
    payload_json: JSON.stringify({ eventType: msg.eventType, platform: msg.platform })
  });

  if (msg.eventType === 'deliveryStatusChanged') {
    await insertOrderEvent(env.DB, {
      id: crypto.randomUUID(),
      order_id: orderId,
      type: 'DELIVERY_STATUS_CHANGED',
      payload_json: JSON.stringify(msg.payload)
    });
  }

  const integration = await env.DB.prepare('SELECT * FROM restaurant_integrations WHERE id = ?')
    .bind(msg.integrationId)
    .first();

  if (integration && integration.auto_approve === 1) {
    await env.ORDER_QUEUE.send({
      type: 'ORDER_AUTO_APPROVE',
      platform: msg.platform,
      orderId,
      integrationId: msg.integrationId,
      tenantId: msg.tenantId,
      attempt: 0
    });
  }

  await env.ORDER_QUEUE.send({
    type: 'ORDER_AUTO_ASSIGN',
    tenantId: msg.tenantId,
    orderId
  });
}

async function handleAutoApprove(env: Env, msg: Extract<QueueMessage, { type: 'ORDER_AUTO_APPROVE' }>): Promise<void> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(msg.orderId).first();
  if (!order) {
    return;
  }

  if (msg.platform === 'migros') {
    const integration = await env.DB.prepare('SELECT * FROM restaurant_integrations WHERE id = ?')
      .bind(msg.integrationId)
      .first();
    if (!integration) {
      return;
    }
    const creds = await getOutboundCreds(env, integration as any);
    const baseUrl = (creds?.base_url as string) ?? 'https://api.migros.example.com';
    const restaurantApiKey = creds?.restaurant_api_key as string;
    const secretKey = creds?.secret_key as string;
    if (!restaurantApiKey || !secretKey) {
      return;
    }
    await migrosPostEncrypted(baseUrl, '/Order/v2/UpdateOrderStatus', restaurantApiKey, secretKey, {
      orderId: order.platform_order_id,
      orderStatus: 'Approved'
    });
    await env.DB.prepare(
      `UPDATE orders SET status = 'APPROVED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
    )
      .bind(order.id)
      .run();
    await insertOrderEvent(env.DB, {
      id: crypto.randomUUID(),
      order_id: order.id,
      type: 'AUTO_APPROVE_SUCCEEDED',
      payload_json: JSON.stringify({ platform: 'migros' })
    });
  }

  if (msg.platform === 'getir') {
    await getirApproveOrder(env, msg.integrationId, order.platform_order_id);
    await env.DB.prepare(
      `UPDATE orders SET status = 'APPROVED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
    )
      .bind(order.id)
      .run();
    await insertOrderEvent(env.DB, {
      id: crypto.randomUUID(),
      order_id: order.id,
      type: 'AUTO_APPROVE_SUCCEEDED',
      payload_json: JSON.stringify({ platform: 'getir' })
    });
  }
}

async function handleAutoAssign(env: Env, msg: Extract<QueueMessage, { type: 'ORDER_AUTO_ASSIGN' }>): Promise<void> {
  const id = env.TENANT_DISPATCHER.idFromName(msg.tenantId);
  const stub = env.TENANT_DISPATCHER.get(id);
  await stub.fetch('https://dispatcher/event', {
    method: 'POST',
    body: JSON.stringify({ type: 'order_ready_for_dispatch', tenantId: msg.tenantId, orderId: msg.orderId })
  });
}
