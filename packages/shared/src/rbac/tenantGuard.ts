import type { JwtClaims } from '../schemas/auth';
import type { Role } from './roles';

export type TenantScope =
  | { type: 'tenant'; tenantId: string }
  | { type: 'restaurant'; tenantId: string; restaurantId: string }
  | { type: 'courier'; tenantId: string; userId: string };

export function resolveTenantScope(claims: JwtClaims): TenantScope {
  if (claims.role === 'restaurant') {
    if (!claims.tenant_id || !claims.restaurant_id) {
      throw new Error('missing restaurant scope');
    }
    return {
      type: 'restaurant',
      tenantId: claims.tenant_id,
      restaurantId: claims.restaurant_id
    };
  }

  if (claims.role === 'courier') {
    if (!claims.tenant_id) {
      throw new Error('missing courier tenant scope');
    }
    return { type: 'courier', tenantId: claims.tenant_id, userId: claims.user_id };
  }

  if (!claims.tenant_id) {
    throw new Error('missing tenant scope');
  }

  return { type: 'tenant', tenantId: claims.tenant_id };
}

export function requireRole(claims: JwtClaims, roles: Role[]): void {
  if (!roles.includes(claims.role)) {
    throw new Error('forbidden');
  }
}
