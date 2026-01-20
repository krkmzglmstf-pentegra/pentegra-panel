import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('webhook receipts idempotency', () => {
  it('prevents duplicates with unique constraint', () => {
    const db = new Database(':memory:');
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const sql = readFileSync(join(baseDir, '../apps/api/migrations/0001_init.sql'), 'utf8');
    db.exec(sql);
    const insert = db.prepare(
      'INSERT INTO webhook_receipts (id, platform, dedupe_key, received_at) VALUES (?, ?, ?, ?)' 
    );
    insert.run('1', 'getir', 'getir:newOrder:123', new Date().toISOString());
    expect(() => {
      insert.run('2', 'getir', 'getir:newOrder:123', new Date().toISOString());
    }).toThrow();
  });
});
