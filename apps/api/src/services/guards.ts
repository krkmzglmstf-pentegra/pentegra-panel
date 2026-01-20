import type { Context, Next } from 'hono';
import { ErrorCodes, resolveTenantScope, requireRole, type JwtClaims } from '@pentegra/shared';
import { verifyJwt } from './auth';
import type { Env } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('authorization');
  const tokenFromQuery = c.req.query('token');
  if (!authHeader?.startsWith('Bearer ') && !tokenFromQuery) {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'missing token' } }, 401);
  }
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : tokenFromQuery!;
  try {
    const claims = await verifyJwt(c.env.JWT_SECRET, token);
    c.set('auth', claims);
    c.set('tenantScope', resolveTenantScope(claims));
  } catch {
    return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'invalid token' } }, 401);
  }
  return next();
}

export function requireRoles(roles: Array<JwtClaims['role']>) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const claims = c.get('auth') as JwtClaims | undefined;
    if (!claims) {
      return c.json({ ok: false, error: { code: ErrorCodes.UNAUTHORIZED, message: 'missing auth' } }, 401);
    }
    try {
      requireRole(claims, roles);
    } catch {
      return c.json({ ok: false, error: { code: ErrorCodes.FORBIDDEN, message: 'forbidden' } }, 403);
    }
    return next();
  };
}
