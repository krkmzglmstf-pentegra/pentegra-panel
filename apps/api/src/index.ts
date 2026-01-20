import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, requireRoles } from './services/guards';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';
import { restaurantRoutes } from './routes/restaurant';
import { courierRoutes } from './routes/courier';
import { webhookRoutes } from './routes/webhooks';
import { streamRoutes } from './routes/stream';
import { handleQueueMessage } from './queue';
import type { Env } from './types';
import { withRequestId } from './services/logger';
import type { JwtClaims, TenantScope } from '@pentegra/shared';
import { TokenBroker } from './durable-objects/TokenBroker';
import { TenantDispatcher } from './durable-objects/TenantDispatcher';
import { Stream } from './durable-objects/Stream';
import type { MessageBatch } from '@cloudflare/workers-types';

type Variables = {
  auth: JwtClaims;
  tenantScope: TenantScope;
  requestId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', cors());
app.use('*', async (c, next) => {
  const requestId = withRequestId(c.req.raw.headers);
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  return next();
});

app.route('/api/auth', authRoutes);
app.route('/api', webhookRoutes);

app.use('/api/auth/me', authMiddleware);
app.use('/api/admin/*', authMiddleware);
app.use('/api/restaurant/*', authMiddleware);
app.use('/api/couriers/*', authMiddleware);
app.use('/api/stream/*', authMiddleware);

adminRoutes.use('*', requireRoles(['admin', 'ops']));
restaurantRoutes.use('*', requireRoles(['restaurant']));
courierRoutes.use('*', requireRoles(['courier']));

app.route('/api/admin', adminRoutes);
app.route('/api/restaurant', restaurantRoutes);
app.route('/api/couriers', courierRoutes);
app.route('/api/stream', streamRoutes);

app.get('/health', (c) => c.json({ ok: true }));

export default {
  fetch: app.fetch,
  queue: async (batch: MessageBatch, env: Env) => {
    for (const message of batch.messages) {
      await handleQueueMessage(env, message.body);
    }
  }
};

export { TokenBroker, TenantDispatcher, Stream };
