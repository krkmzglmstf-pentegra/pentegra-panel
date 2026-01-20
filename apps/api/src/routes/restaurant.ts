import { Hono } from 'hono';
import { ManualOrderActionSchema, ErrorCodes } from '@pentegra/shared';
import { dbAll, dbGet } from '../services/db';
import type { Env } from '../types';
import { migrosPostEncrypted } from '../adapters/migros';
import { getOutboundCreds } from '../services/integrations';

export const restaurantRoutes = new Hono<{ Bindings: Env }>();

restaurantRoutes.get('/orders', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; restaurantId: string };
  const orders = await dbAll(
    c.env.DB,
    'SELECT * FROM orders WHERE tenant_id = ? AND restaurant_id = ? ORDER BY created_at DESC LIMIT 200',
    [scope.tenantId, scope.restaurantId]
  );
  return c.json({ ok: true, data: orders });
});

restaurantRoutes.get('/orders/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; restaurantId: string };
  const order = await dbGet(
    c.env.DB,
    'SELECT * FROM orders WHERE id = ? AND tenant_id = ? AND restaurant_id = ?',
    [c.req.param('id'), scope.tenantId, scope.restaurantId]
  );
  if (!order) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }
  const events = await dbAll(
    c.env.DB,
    'SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at ASC',
    [c.req.param('id')]
  );
  return c.json({ ok: true, data: { order, events } });
});

restaurantRoutes.post('/orders/:id/actions', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; restaurantId: string };
  const body = await c.req.json();
  const parsed = ManualOrderActionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const order = await dbGet(
    c.env.DB,
    'SELECT * FROM orders WHERE id = ? AND tenant_id = ? AND restaurant_id = ?',
    [c.req.param('id'), scope.tenantId, scope.restaurantId]
  );
  if (!order) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }

  if (order.platform === 'migros') {
    const integration = await dbGet(
      c.env.DB,
      'SELECT * FROM restaurant_integrations WHERE restaurant_id = ? AND platform = ?',
      [scope.restaurantId, 'migros']
    );
    if (!integration) {
      return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'integration missing' } }, 404);
    }
    const creds = await getOutboundCreds(c.env, integration as any);
    const baseUrl = (creds?.base_url as string) ?? 'https://api.migros.example.com';
    const restaurantApiKey = creds?.restaurant_api_key as string;
    const secretKey = creds?.secret_key as string;
    if (!restaurantApiKey || !secretKey) {
      return c.json({ ok: false, error: { code: ErrorCodes.CONFLICT, message: 'missing credentials' } }, 409);
    }
    const statusMap: Record<string, string> = {
      approve: 'Approved',
      reject: 'Rejected',
      prepare: 'Prepared',
      delivery: 'Delivery',
      completed: 'Completed'
    };
    await migrosPostEncrypted(baseUrl, '/Order/v2/UpdateOrderStatus', restaurantApiKey, secretKey, {
      orderId: order.platform_order_id,
      orderStatus: statusMap[parsed.data.action]
    });
  }

  await c.env.DB.prepare(
    'INSERT INTO order_events (id, order_id, type, payload_json) VALUES (?, ?, ?, ?)'
  )
    .bind(
      crypto.randomUUID(),
      order.id,
      'MANUAL_ACTION',
      JSON.stringify({ action: parsed.data.action })
    )
    .run();

  return c.json({ ok: true });
});
