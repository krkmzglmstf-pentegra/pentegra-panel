import { Hono } from 'hono';
import {
  GetirNewOrderSchema,
  GetirCancelOrderSchema,
  MigrosOrderCreatedSchema,
  MigrosOrderCanceledSchema,
  MigrosDeliveryStatusChangedSchema,
  YemeksepetiWebhookSchema,
  ErrorCodes
} from '@pentegra/shared';
import type { Env } from '../types';
import { getIntegrationByPlatformId, getInboundAuth, verifyApiKey, verifyBasicAuth } from '../services/integrations';

export const webhookRoutes = new Hono<{ Bindings: Env }>();

async function insertReceipt(env: Env, platform: string, dedupeKey: string): Promise<boolean> {
  try {
    await env.DB.prepare(
      `INSERT INTO webhook_receipts (id, platform, dedupe_key, received_at)
       VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    )
      .bind(crypto.randomUUID(), platform, dedupeKey)
      .run();
    return true;
  } catch {
    return false;
  }
}

webhookRoutes.post('/getir/newOrder', async (c) => {
  const body = await c.req.json();
  const parsed = GetirNewOrderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const platformRestaurantId = parsed.data.restaurant.id;
  const integration = await getIntegrationByPlatformId(c.env.DB, 'getir', platformRestaurantId);
  if (!integration) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration not found' } }, 404);
  }

  const inbound = await getInboundAuth(c.env, integration);
  const apiKeyHeader = c.req.header('x-api-key');
  const basicHeader = c.req.header('authorization');

  const apiKeyExpected = (inbound?.x_api_key as string) ?? c.env.GETIR_GLOBAL_X_API_KEY;
  const basicExpected = (inbound?.basic_auth as string) ?? c.env.GETIR_GLOBAL_BASIC_AUTH;

  if (!verifyApiKey(apiKeyHeader, apiKeyExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }
  if (basicExpected && !verifyBasicAuth(basicHeader, basicExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }

  const dedupeKey = `getir:newOrder:${parsed.data.id}`;
  const inserted = await insertReceipt(c.env, 'getir', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  const tenantId = await getTenantId(c.env.DB, integration.restaurant_id);
  if (!tenantId) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'tenant not found' } }, 404);
  }
  await c.env.ORDER_QUEUE.send({
    type: 'ORDER_INGEST',
    platform: 'getir',
    eventType: 'newOrder',
    receivedAt: new Date().toISOString(),
    payload: parsed.data,
    integrationId: integration.id,
    restaurantId: integration.restaurant_id,
    tenantId
  });

  return c.json({ ok: true });
});

webhookRoutes.post('/getir/cancelOrder', async (c) => {
  const body = await c.req.json();
  const parsed = GetirCancelOrderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const platformRestaurantId = parsed.data.restaurant.id;
  const integration = await getIntegrationByPlatformId(c.env.DB, 'getir', platformRestaurantId);
  if (!integration) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration not found' } }, 404);
  }

  const inbound = await getInboundAuth(c.env, integration);
  const apiKeyHeader = c.req.header('x-api-key');
  const basicHeader = c.req.header('authorization');

  const apiKeyExpected = (inbound?.x_api_key as string) ?? c.env.GETIR_GLOBAL_X_API_KEY;
  const basicExpected = (inbound?.basic_auth as string) ?? c.env.GETIR_GLOBAL_BASIC_AUTH;

  if (!verifyApiKey(apiKeyHeader, apiKeyExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }
  if (basicExpected && !verifyBasicAuth(basicHeader, basicExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }

  const dedupeKey = `getir:cancelOrder:${parsed.data.id}`;
  const inserted = await insertReceipt(c.env, 'getir', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  const tenantId = await getTenantId(c.env.DB, integration.restaurant_id);
  if (!tenantId) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'tenant not found' } }, 404);
  }
  await c.env.ORDER_QUEUE.send({
    type: 'ORDER_INGEST',
    platform: 'getir',
    eventType: 'cancelOrder',
    receivedAt: new Date().toISOString(),
    payload: parsed.data,
    integrationId: integration.id,
    restaurantId: integration.restaurant_id,
    tenantId
  });

  return c.json({ ok: true });
});

webhookRoutes.post('/migros/orderCreated', async (c) => {
  const body = await c.req.json();
  const parsed = MigrosOrderCreatedSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const integration = await getIntegrationByPlatformId(c.env.DB, 'migros', parsed.data.store.id);
  if (!integration) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration not found' } }, 404);
  }

  const inbound = await getInboundAuth(c.env, integration);
  const basicExpected = (inbound?.basic_auth as string) ?? c.env.MIGROS_GLOBAL_BASIC_AUTH;
  if (!verifyBasicAuth(c.req.header('authorization'), basicExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }

  const dedupeKey = `migros:orderCreated:${parsed.data.id}`;
  const inserted = await insertReceipt(c.env, 'migros', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  const tenantId = await getTenantId(c.env.DB, integration.restaurant_id);
  if (!tenantId) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'tenant not found' } }, 404);
  }
  await c.env.ORDER_QUEUE.send({
    type: 'ORDER_INGEST',
    platform: 'migros',
    eventType: 'orderCreated',
    receivedAt: new Date().toISOString(),
    payload: parsed.data,
    integrationId: integration.id,
    restaurantId: integration.restaurant_id,
    tenantId
  });

  return c.json({ ok: true });
});

webhookRoutes.post('/migros/orderCanceled', async (c) => {
  const body = await c.req.json();
  const parsed = MigrosOrderCanceledSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const integration = await getIntegrationByPlatformId(c.env.DB, 'migros', parsed.data.StoreId);
  if (!integration) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration not found' } }, 404);
  }

  const inbound = await getInboundAuth(c.env, integration);
  const basicExpected = (inbound?.basic_auth as string) ?? c.env.MIGROS_GLOBAL_BASIC_AUTH;
  if (!verifyBasicAuth(c.req.header('authorization'), basicExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }

  const dedupeKey = `migros:orderCanceled:${parsed.data.OrderId}`;
  const inserted = await insertReceipt(c.env, 'migros', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  const tenantId = await getTenantId(c.env.DB, integration.restaurant_id);
  if (!tenantId) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'tenant not found' } }, 404);
  }
  await c.env.ORDER_QUEUE.send({
    type: 'ORDER_INGEST',
    platform: 'migros',
    eventType: 'orderCanceled',
    receivedAt: new Date().toISOString(),
    payload: parsed.data,
    integrationId: integration.id,
    restaurantId: integration.restaurant_id,
    tenantId
  });

  return c.json({ ok: true });
});

webhookRoutes.post('/migros/deliveryStatusChanged', async (c) => {
  const body = await c.req.json();
  const parsed = MigrosDeliveryStatusChangedSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const integration = await getIntegrationByPlatformId(c.env.DB, 'migros', parsed.data.storeId);
  if (!integration) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration not found' } }, 404);
  }

  const inbound = await getInboundAuth(c.env, integration);
  const basicExpected = (inbound?.basic_auth as string) ?? c.env.MIGROS_GLOBAL_BASIC_AUTH;
  if (!verifyBasicAuth(c.req.header('authorization'), basicExpected)) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }

  const dedupeKey = `migros:deliveryStatus:${parsed.data.orderId}:${parsed.data.deliveryStatus}`;
  const inserted = await insertReceipt(c.env, 'migros', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  const tenantId = await getTenantId(c.env.DB, integration.restaurant_id);
  if (!tenantId) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'tenant not found' } }, 404);
  }
  await c.env.ORDER_QUEUE.send({
    type: 'ORDER_INGEST',
    platform: 'migros',
    eventType: 'deliveryStatusChanged',
    receivedAt: new Date().toISOString(),
    payload: parsed.data,
    integrationId: integration.id,
    restaurantId: integration.restaurant_id,
    tenantId
  });

  return c.json({ ok: true });
});

webhookRoutes.post('/yemeksepeti/webhook', async (c) => {
  const body = await c.req.json();
  const parsed = YemeksepetiWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const dedupeKey = `yemeksepeti:${crypto.randomUUID()}`;
  const inserted = await insertReceipt(c.env, 'yemeksepeti', dedupeKey);
  if (!inserted) {
    return c.json({ ok: true, data: { duplicate: true } });
  }

  return c.json({ ok: true, data: { queued: false } });
});

async function getTenantId(db: Env['DB'], restaurantId: string): Promise<string> {
  const row = await db
    .prepare('SELECT tenant_id FROM restaurants WHERE id = ?')
    .bind(restaurantId)
    .first<{ tenant_id: string }>();
  return row?.tenant_id ?? '';
}
