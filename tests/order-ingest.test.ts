import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleQueueMessage } from '../apps/api/src/queue';

class D1Mock {
  private db: Database.Database;
  constructor(db: Database.Database) {
    this.db = db;
  }
  prepare(sql: string) {
    const db = this.db;
    return {
      bind(...params: unknown[]) {
        return {
          run() {
            db.prepare(sql).run(...params);
            return { success: true };
          },
          first<T>() {
            return db.prepare(sql).get(...params) as T | null;
          },
          all<T>() {
            return { results: db.prepare(sql).all(...params) as T[] };
          }
        };
      }
    };
  }
}

describe('order ingest', () => {
  it('upserts order from migros orderCreated', async () => {
    const db = new Database(':memory:');
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const sql = readFileSync(join(baseDir, '../apps/api/migrations/0001_init.sql'), 'utf8');
    db.exec(sql);
    db.prepare('INSERT INTO restaurants (id, tenant_id, name, address, lat, lon) VALUES (?, ?, ?, ?, ?, ?)')
      .run('r1', 't1', 'Test', 'Addr', 0, 0);
    db.prepare('INSERT INTO restaurant_integrations (id, restaurant_id, platform, platform_restaurant_id) VALUES (?, ?, ?, ?)')
      .run('i1', 'r1', 'migros', 'store-1');

    const env = {
      DB: new D1Mock(db),
      ORDER_QUEUE: { send: async () => undefined },
      TENANT_DISPATCHER: { idFromName: () => ({}) } as any
    } as any;

    await handleQueueMessage(env, {
      type: 'ORDER_INGEST',
      platform: 'migros',
      eventType: 'orderCreated',
      receivedAt: new Date().toISOString(),
      payload: { id: 'o1', store: { id: 'store-1' }, status: 'NEW_PENDING' },
      integrationId: 'i1',
      restaurantId: 'r1',
      tenantId: 't1'
    });

    const order = db.prepare('SELECT * FROM orders WHERE platform_order_id = ?').get('o1');
    expect(order).toBeTruthy();
    expect(order.status).toBe('NEW_PENDING');
  });
});
