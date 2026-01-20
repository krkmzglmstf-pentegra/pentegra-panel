import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('webhook receipts idempotency', () => {
  it('prevents duplicates with unique constraint', () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const sql = readFileSync(join(baseDir, '../apps/api/migrations/0001_init.sql'), 'utf8');
    db.exec(sql);
    db.run(
      'INSERT INTO webhook_receipts (id, platform, dedupe_key, received_at) VALUES (?, ?, ?, ?)',
      ['1', 'getir', 'getir:newOrder:123', new Date().toISOString()]
    );
    expect(() => {
      db.run(
        'INSERT INTO webhook_receipts (id, platform, dedupe_key, received_at) VALUES (?, ?, ?, ?)',
        ['2', 'getir', 'getir:newOrder:123', new Date().toISOString()]
      );
    }).toThrow();
  });
});
