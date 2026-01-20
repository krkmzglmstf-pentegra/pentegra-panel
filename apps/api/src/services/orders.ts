import type { D1Database } from '@cloudflare/workers-types';

export type OrderInsert = {
  id: string;
  tenant_id: string;
  restaurant_id: string;
  platform: string;
  platform_order_id: string;
  status: string;
  delivery_provider?: string | null;
  created_at: string;
  updated_at: string;
  raw_json?: string | null;
};

export async function upsertOrder(db: D1Database, order: OrderInsert): Promise<void> {
  await db
    .prepare(
      `INSERT INTO orders (id, tenant_id, restaurant_id, platform, platform_order_id, status, delivery_provider, created_at, updated_at, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(platform, platform_order_id) DO UPDATE SET
         status = excluded.status,
         delivery_provider = excluded.delivery_provider,
         updated_at = excluded.updated_at,
         raw_json = excluded.raw_json`
    )
    .bind(
      order.id,
      order.tenant_id,
      order.restaurant_id,
      order.platform,
      order.platform_order_id,
      order.status,
      order.delivery_provider ?? null,
      order.created_at,
      order.updated_at,
      order.raw_json ?? null
    )
    .run();
}

export async function insertOrderEvent(
  db: D1Database,
  event: { id: string; order_id: string; type: string; payload_json: string; created_at?: string }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO order_events (id, order_id, type, payload_json, created_at)
       VALUES (?, ?, ?, ?, COALESCE(?, strftime('%Y-%m-%dT%H:%M:%fZ','now')))`
    )
    .bind(event.id, event.order_id, event.type, event.payload_json, event.created_at ?? null)
    .run();
}
