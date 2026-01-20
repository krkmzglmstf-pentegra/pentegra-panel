import { Hono } from 'hono';
import { ErrorCodes } from '@pentegra/shared';
import type { Env } from '../types';

export const courierRoutes = new Hono<{ Bindings: Env }>();

courierRoutes.get('/me', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; userId: string };
  const courier = await c.env.DB.prepare(
    'SELECT * FROM couriers WHERE tenant_id = ? AND user_id = ?'
  )
    .bind(scope.tenantId, scope.userId)
    .first();
  if (!courier) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }
  return c.json({ ok: true, data: courier });
});

courierRoutes.post('/me/status', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; userId: string };
  const body = (await c.req.json()) as { status: 'online' | 'offline' | 'break'; auto_assign_enabled: boolean };
  await c.env.DB.prepare(
    `UPDATE couriers SET status = ?, auto_assign_enabled = ?, last_seen_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE tenant_id = ? AND user_id = ?`
  )
    .bind(body.status, body.auto_assign_enabled ? 1 : 0, scope.tenantId, scope.userId)
    .run();
  return c.json({ ok: true });
});

courierRoutes.post('/me/location', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; userId: string };
  const body = (await c.req.json()) as {
    lat: number;
    lon: number;
    accuracy_m?: number;
    speed_mps?: number;
    heading_deg?: number;
    recorded_at: string;
  };
  const courier = await c.env.DB.prepare(
    'SELECT * FROM couriers WHERE tenant_id = ? AND user_id = ?'
  )
    .bind(scope.tenantId, scope.userId)
    .first();
  if (!courier) {
    return c.json({ ok: false, error: { code: ErrorCodes.NOT_FOUND, message: 'not found' } }, 404);
  }
  await c.env.DB.prepare(
    `INSERT INTO courier_locations (id, courier_id, lat, lon, accuracy_m, speed_mps, heading_deg, recorded_at, received_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
  )
    .bind(
      crypto.randomUUID(),
      courier.id,
      body.lat,
      body.lon,
      body.accuracy_m ?? null,
      body.speed_mps ?? null,
      body.heading_deg ?? null,
      body.recorded_at
    )
    .run();

  return c.json({ ok: true });
});
