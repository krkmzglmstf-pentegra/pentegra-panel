import type { DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from '../types';
import { haversineDistanceMeters } from '@pentegra/shared';

export class TenantDispatcher {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 });
    }
    const body = (await request.json()) as {
      type: string;
      tenantId: string;
      orderId?: string;
    };

    if (body.type === 'order_ready_for_dispatch' && body.orderId) {
      await this.assignOrder(body.tenantId, body.orderId);
      return new Response('ok');
    }

    return new Response('ignored');
  }

  private async assignOrder(tenantId: string, orderId: string): Promise<void> {
    const order = await this.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND tenant_id = ?'
    )
      .bind(orderId, tenantId)
      .first();

    if (!order) {
      return;
    }

    const restaurant = await this.env.DB.prepare(
      'SELECT * FROM restaurants WHERE id = ? AND tenant_id = ?'
    )
      .bind(order.restaurant_id, tenantId)
      .first();

    if (!restaurant) {
      return;
    }

    const couriers = await this.env.DB.prepare(
      `SELECT c.*, l.lat as last_lat, l.lon as last_lon
       FROM couriers c
       LEFT JOIN courier_locations l ON l.courier_id = c.id
       WHERE c.tenant_id = ? AND c.status = 'online' AND c.auto_assign_enabled = 1`
    )
      .bind(tenantId)
      .all();

    if (!couriers.results.length) {
      return;
    }

    const scored = couriers.results
      .filter((c) => c.last_lat !== null && c.last_lon !== null)
      .map((c) => {
        const distance = haversineDistanceMeters(
          restaurant.lat,
          restaurant.lon,
          c.last_lat,
          c.last_lon
        );
        return { courier: c, distance };
      });

    if (!scored.length) {
      return;
    }

    const assignmentCounts = await this.env.DB.prepare(
      `SELECT courier_id, COUNT(*) as count
       FROM assignments
       WHERE status IN ('assigned','accepted')
       GROUP BY courier_id`
    ).all();

    const countMap = new Map<string, number>();
    for (const row of assignmentCounts.results) {
      countMap.set(row.courier_id as string, row.count as number);
    }

    scored.sort((a, b) => {
      const dist = a.distance - b.distance;
      if (dist !== 0) return dist;
      const aCount = countMap.get(a.courier.id as string) ?? 0;
      const bCount = countMap.get(b.courier.id as string) ?? 0;
      if (aCount !== bCount) return aCount - bCount;
      return (a.courier.last_seen_at ?? '').localeCompare(b.courier.last_seen_at ?? '');
    });

    const winner = scored[0]?.courier;
    if (!winner) {
      return;
    }

    const assignmentId = crypto.randomUUID();
    await this.env.DB.prepare(
      `INSERT INTO assignments (id, order_id, courier_id, status, assigned_at)
       VALUES (?, ?, ?, 'assigned', strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    )
      .bind(assignmentId, orderId, winner.id)
      .run();

    await this.env.DB.prepare(
      `UPDATE orders SET status = 'ASSIGNED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`
    )
      .bind(orderId)
      .run();

    await this.env.DB.prepare(
      `INSERT INTO order_events (id, order_id, type, payload_json)
       VALUES (?, ?, 'AUTO_ASSIGN_SUCCEEDED', ?)`
    )
      .bind(
        crypto.randomUUID(),
        orderId,
        JSON.stringify({ courierId: winner.id, distanceMeters: scored[0].distance })
      )
      .run();

    const streamId = this.env.STREAM.idFromName(tenantId);
    const streamStub = this.env.STREAM.get(streamId);
    await streamStub.fetch('https://stream/publish', {
      method: 'POST',
      body: JSON.stringify({
        scope: 'admin',
        key: tenantId,
        event: { type: 'assignment', orderId, courierId: winner.id }
      })
    });

    const restaurantStreamId = this.env.STREAM.idFromName(restaurant.id as string);
    const restaurantStub = this.env.STREAM.get(restaurantStreamId);
    await restaurantStub.fetch('https://stream/publish', {
      method: 'POST',
      body: JSON.stringify({
        scope: 'restaurant',
        key: restaurant.id,
        event: { type: 'assignment', orderId, courierId: winner.id }
      })
    });
  }
}
