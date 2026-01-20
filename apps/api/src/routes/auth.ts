import { Hono } from 'hono';
import { LoginRequestSchema } from '@pentegra/shared';
import { dbGet } from '../services/db';
import { verifyPassword, signJwt } from '../services/auth';
import type { Env } from '../types';
import { ErrorCodes } from '@pentegra/shared';

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post('/login', async (c) => {
  try {
    const raw = await c.req.text();
    let body: unknown;
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
      body = JSON.parse(trimmed);
    } else {
      const params = new URLSearchParams(raw);
      body = {
        email: params.get('email'),
        password: params.get('password')
      };
    }
    const parsed = LoginRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          ok: false,
          error: {
            code: ErrorCodes.VALIDATION,
            message: 'invalid payload',
            details: parsed.error.flatten()
          }
        },
        400
      );
    }

    const user = await dbGet<{ id: string; email: string; password_hash: string; disabled_at: string | null }>(
      c.env.DB,
      'SELECT * FROM users WHERE email = ?',
      [parsed.data.email]
    );

    if (!user || user.disabled_at) {
      return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'invalid credentials' } }, 401);
    }

    const valid = await verifyPassword(parsed.data.password, user.password_hash);
    if (!valid) {
      return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'invalid credentials' } }, 401);
    }

    const membership = await dbGet<{ tenant_id: string; role: 'admin' | 'ops' | 'restaurant' | 'courier' }>(
      c.env.DB,
      'SELECT tenant_id, role FROM tenant_members WHERE user_id = ?',
      [user.id]
    );

    if (!membership) {
      return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'no tenant' } }, 401);
    }

    let restaurantId: string | undefined;
    if (membership.role === 'restaurant') {
      const restaurant = await dbGet<{ restaurant_id: string }>(
        c.env.DB,
        'SELECT restaurant_id FROM restaurant_users WHERE user_id = ?',
        [user.id]
      );
      restaurantId = restaurant?.restaurant_id;
    }

    const token = await signJwt(c.env.JWT_SECRET, {
      user_id: user.id,
      role: membership.role,
      tenant_id: membership.tenant_id,
      restaurant_id: restaurantId
    });

    return c.json({ ok: true, data: { token } });
  } catch (error) {
    console.error('auth_login_failed', { error: String(error) });
    return c.json(
      {
        ok: false,
        error: { code: ErrorCodes.INTERNAL, message: 'internal error', details: String(error) }
      },
      500
    );
  }
});

authRoutes.get('/me', async (c) => {
  const auth = c.get('auth') as { user_id: string; role: string; tenant_id?: string; restaurant_id?: string };
  return c.json({ ok: true, data: auth });
});
