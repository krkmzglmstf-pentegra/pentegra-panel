import type { DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from '../types';

type Connection = {
  writer: WritableStreamDefaultWriter<string>;
};

export class Stream {
  private state: DurableObjectState;
  private env: Env;
  private connections: Set<Connection>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.connections = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/publish' && request.method === 'POST') {
      const body = (await request.json()) as { event: unknown };
      const payload = `data: ${JSON.stringify(body.event)}\n\n`;
      for (const connection of this.connections) {
        await connection.writer.write(payload);
      }
      return new Response('ok');
    }

    if (url.pathname === '/subscribe') {
      const scope = request.headers.get('x-scope');
      const key = request.headers.get('x-key');
      if (!scope || !key) {
        return new Response('missing scope', { status: 400 });
      }

      const stream = new TransformStream<string>();
      const writer = stream.writable.getWriter();
      const connection = { writer };
      this.connections.add(connection);

      const snapshot = await this.loadSnapshot(scope, key);
      for (const item of snapshot) {
        await writer.write(`data: ${JSON.stringify(item)}\n\n`);
      }

      const response = new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        }
      });

      request.signal.addEventListener('abort', () => {
        this.connections.delete(connection);
        writer.close().catch(() => undefined);
      });

      return response;
    }

    return new Response('not found', { status: 404 });
  }

  private async loadSnapshot(scope: string, key: string): Promise<unknown[]> {
    if (scope === 'admin') {
      const result = await this.env.DB.prepare(
        `SELECT oe.type, oe.payload_json, oe.created_at
         FROM order_events oe
         JOIN orders o ON o.id = oe.order_id
         WHERE o.tenant_id = ?
         ORDER BY oe.created_at DESC
         LIMIT 20`
      )
        .bind(key)
        .all();
      return result.results.map((row) => ({
        type: row.type,
        payload: JSON.parse(row.payload_json as string),
        created_at: row.created_at
      }));
    }

    if (scope === 'restaurant') {
      const result = await this.env.DB.prepare(
        `SELECT oe.type, oe.payload_json, oe.created_at
         FROM order_events oe
         JOIN orders o ON o.id = oe.order_id
         WHERE o.restaurant_id = ?
         ORDER BY oe.created_at DESC
         LIMIT 20`
      )
        .bind(key)
        .all();
      return result.results.map((row) => ({
        type: row.type,
        payload: JSON.parse(row.payload_json as string),
        created_at: row.created_at
      }));
    }

    return [];
  }
}
