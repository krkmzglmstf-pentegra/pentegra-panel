import { Hono } from 'hono';
import {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  IntegrationUpsertSchema,
  ErrorCodes
} from '@pentegra/shared';
import { dbAll, dbGet } from '../services/db';
import type { Env } from '../types';
import { encryptJson } from '../services/crypto';

export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.get('/restaurants', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const restaurants = await dbAll(c.env.DB, 'SELECT * FROM restaurants WHERE tenant_id = ?', [
    scope.tenantId
  ]);
  return c.json({ ok: true, data: restaurants });
});

adminRoutes.post('/restaurants', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const body = await c.req.json();
  const parsed = CreateRestaurantSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO restaurants (id, tenant_id, name, address, lat, lon) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(id, scope.tenantId, parsed.data.name, parsed.data.address, parsed.data.lat, parsed.data.lon)
    .run();
  return c.json({ ok: true, data: { id } }, 201);
});

adminRoutes.get('/restaurants/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const restaurant = await dbGet(c.env.DB, 'SELECT * FROM restaurants WHERE id = ? AND tenant_id = ?', [
    c.req.param('id'),
    scope.tenantId
  ]);
  if (!restaurant) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }
  return c.json({ ok: true, data: restaurant });
});

adminRoutes.patch('/restaurants/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const body = await c.req.json();
  const parsed = UpdateRestaurantSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }
  const updates = parsed.data;
  await c.env.DB.prepare(
    `UPDATE restaurants SET
      name = COALESCE(?, name),
      address = COALESCE(?, address),
      lat = COALESCE(?, lat),
      lon = COALESCE(?, lon)
     WHERE id = ? AND tenant_id = ?`
  )
    .bind(
      updates.name ?? null,
      updates.address ?? null,
      updates.lat ?? null,
      updates.lon ?? null,
      c.req.param('id'),
      scope.tenantId
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/restaurants/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  await c.env.DB.prepare('DELETE FROM restaurants WHERE id = ? AND tenant_id = ?')
    .bind(c.req.param('id'), scope.tenantId)
    .run();
  return c.json({ ok: true });
});

adminRoutes.get('/restaurants/:id/integrations', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const integrations = await dbAll(
    c.env.DB,
    `SELECT ri.* FROM restaurant_integrations ri
     JOIN restaurants r ON r.id = ri.restaurant_id
     WHERE r.id = ? AND r.tenant_id = ?`,
    [c.req.param('id'), scope.tenantId]
  );
  return c.json({ ok: true, data: integrations });
});

adminRoutes.put('/restaurants/:id/integrations/:platform', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const restaurant = await dbGet(
    c.env.DB,
    'SELECT id FROM restaurants WHERE id = ? AND tenant_id = ?',
    [c.req.param('id'), scope.tenantId]
  );
  if (!restaurant) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }
  const body = await c.req.json();
  const parsed = IntegrationUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid payload' } }, 400);
  }

  const platform = c.req.param('platform');
  if (!['getir', 'migros', 'yemeksepeti'].includes(platform)) {
    return c.json({ ok: false, error: { code: ErrorCodes.VALIDATION, message: 'invalid platform' } }, 400);
  }
  const integrationId = crypto.randomUUID();
  const inboundCipher = parsed.data.inbound_auth
    ? await encryptJson(c.env.CRED_MASTER_KEY_BASE64, parsed.data.inbound_auth)
    : null;
  const outboundCipher = parsed.data.outbound_credentials
    ? await encryptJson(c.env.CRED_MASTER_KEY_BASE64, parsed.data.outbound_credentials)
    : null;

  await c.env.DB.prepare(
    `INSERT INTO restaurant_integrations
      (id, restaurant_id, platform, platform_restaurant_id, inbound_auth_ciphertext, outbound_cred_ciphertext, auto_approve, auto_print)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(platform, platform_restaurant_id) DO UPDATE SET
       inbound_auth_ciphertext = excluded.inbound_auth_ciphertext,
       outbound_cred_ciphertext = excluded.outbound_cred_ciphertext,
       auto_approve = excluded.auto_approve,
       auto_print = excluded.auto_print`
  )
    .bind(
      integrationId,
      c.req.param('id'),
      platform,
      parsed.data.platform_restaurant_id,
      inboundCipher,
      outboundCipher,
      parsed.data.auto_approve ? 1 : 0,
      parsed.data.auto_print ? 1 : 0
    )
    .run();

  return c.json({ ok: true });
});

adminRoutes.get('/orders', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const restaurantId = c.req.query('restaurant_id');
  const status = c.req.query('status');
  const params: unknown[] = [scope.tenantId];
  let sql = 'SELECT * FROM orders WHERE tenant_id = ?';
  if (restaurantId) {
    sql += ' AND restaurant_id = ?';
    params.push(restaurantId);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC LIMIT 200';
  const orders = await dbAll(c.env.DB, sql, params);
  return c.json({ ok: true, data: orders });
});

adminRoutes.get('/orders/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string };
  const order = await dbGet(
    c.env.DB,
    'SELECT * FROM orders WHERE id = ? AND tenant_id = ?',
    [c.req.param('id'), scope.tenantId]
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
