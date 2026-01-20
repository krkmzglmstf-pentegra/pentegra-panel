import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleQueueMessage } from '../apps/api/src/queue';

class D1Mock {
  private db: any;
  constructor(db: any) {
    this.db = db;
  }
  prepare(sql: string) {
    const db = this.db;
    return {
      bind(...params: unknown[]) {
        return {
          run() {
            db.run(sql, params as any);
            return { success: true };
          },
          first<T>() {
            const result = db.exec(sql, params as any);
            if (!result.length || !result[0].values.length) return null;
            const columns = result[0].columns;
            const values = result[0].values[0];
            const row = Object.fromEntries(columns.map((col, idx) => [col, values[idx]]));
            return row as T;
          },
          all<T>() {
            const result = db.exec(sql, params as any);
            if (!result.length) return { results: [] as T[] };
            const columns = result[0].columns;
            const rows = result[0].values.map((values: any[]) =>
              Object.fromEntries(columns.map((col, idx) => [col, values[idx]]))
            );
            return { results: rows as T[] };
          }
        };
      }
    };
  }
}

describe('order ingest', () => {
  it('upserts order from migros orderCreated', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const sql = readFileSync(join(baseDir, '../apps/api/migrations/0001_init.sql'), 'utf8');
    db.exec(sql);
    db.run(
      'INSERT INTO restaurants (id, tenant_id, name, address, lat, lon) VALUES (?, ?, ?, ?, ?, ?)',
      ['r1', 't1', 'Test', 'Addr', 0, 0]
    );
    db.run(
      'INSERT INTO restaurant_integrations (id, restaurant_id, platform, platform_restaurant_id) VALUES (?, ?, ?, ?)',
      ['i1', 'r1', 'migros', 'store-1']
    );

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

    const result = db.exec('SELECT * FROM orders WHERE platform_order_id = ?', ['o1']);
    expect(result[0].values.length).toBe(1);
    const columns = result[0].columns;
    const values = result[0].values[0];
    const row = Object.fromEntries(columns.map((col, idx) => [col, values[idx]]));
    expect(row.status).toBe('NEW_PENDING');
  });
});
