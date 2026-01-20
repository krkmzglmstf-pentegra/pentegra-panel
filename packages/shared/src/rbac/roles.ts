export type Role = 'admin' | 'ops' | 'restaurant' | 'courier';

export const RoleHierarchy: Record<Role, number> = {
  admin: 3,
  ops: 2,
  restaurant: 1,
  courier: 1
};
