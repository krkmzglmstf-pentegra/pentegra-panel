import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const LoginResponseSchema = z.object({
  token: z.string()
});

export const JwtClaimsSchema = z.object({
  user_id: z.string(),
  role: z.enum(['admin', 'ops', 'restaurant', 'courier']),
  tenant_id: z.string().optional(),
  restaurant_id: z.string().optional()
});

export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
