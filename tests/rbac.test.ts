import { describe, expect, it } from 'vitest';
import { resolveTenantScope } from '../packages/shared/src/rbac/tenantGuard';

describe('tenant guard', () => {
  it('resolves admin tenant scope', () => {
    const scope = resolveTenantScope({
      user_id: 'u1',
      role: 'admin',
      tenant_id: 't1'
    });
    expect(scope.type).toBe('tenant');
  });

  it('resolves restaurant scope', () => {
    const scope = resolveTenantScope({
      user_id: 'u2',
      role: 'restaurant',
      tenant_id: 't1',
      restaurant_id: 'r1'
    });
    expect(scope.type).toBe('restaurant');
  });
});
