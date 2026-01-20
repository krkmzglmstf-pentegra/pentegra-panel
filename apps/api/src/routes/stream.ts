import { Hono } from 'hono';
import type { Env } from '../types';
import { ErrorCodes } from '@pentegra/shared';

export const streamRoutes = new Hono<{ Bindings: Env }>();

streamRoutes.get('/admin', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string } | undefined;
  if (!scope) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'unauthorized' } }, 401);
  }
  const id = c.env.STREAM.idFromName(scope.tenantId);
  const stub = c.env.STREAM.get(id);
  return stub.fetch('https://stream/subscribe', {
    headers: {
      'x-scope': 'admin',
      'x-key': scope.tenantId
    }
  });
});

streamRoutes.get('/restaurants/:id', async (c) => {
  const scope = c.get('tenantScope') as { tenantId: string; restaurantId: string } | undefined;
  if (!scope || scope.restaurantId !== c.req.param('id')) {
    return c.json({ ok: false, error: { code: ErrorCodes.FORBIDDEN, message: 'forbidden' } }, 403);
  }
  const id = c.env.STREAM.idFromName(scope.restaurantId);
  const stub = c.env.STREAM.get(id);
  return stub.fetch('https://stream/subscribe', {
    headers: {
      'x-scope': 'restaurant',
      'x-key': scope.restaurantId
    }
  });
});
