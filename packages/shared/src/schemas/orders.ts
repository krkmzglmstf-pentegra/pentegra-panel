import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'RECEIVED',
  'NEW_PENDING',
  'APPROVED',
  'REJECTED',
  'PREPARED',
  'DELIVERY',
  'COMPLETED',
  'CANCELLED',
  'ASSIGNED'
]);

export const OrderEventTypeSchema = z.enum([
  'WEBHOOK_RECEIVED',
  'AUTO_APPROVE_REQUESTED',
  'AUTO_APPROVE_FAILED',
  'AUTO_APPROVE_SUCCEEDED',
  'AUTO_ASSIGN_REQUESTED',
  'AUTO_ASSIGN_SUCCEEDED',
  'AUTO_ASSIGN_FAILED',
  'DELIVERY_STATUS_CHANGED'
]);

export const CreateRestaurantSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  lat: z.number(),
  lon: z.number()
});

export const UpdateRestaurantSchema = CreateRestaurantSchema.partial();

export const IntegrationUpsertSchema = z.object({
  platform_restaurant_id: z.string().min(1),
  inbound_auth: z.record(z.string(), z.unknown()).optional(),
  outbound_credentials: z.record(z.string(), z.unknown()).optional(),
  auto_approve: z.boolean().optional(),
  auto_print: z.boolean().optional()
});

export const ManualOrderActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'prepare', 'delivery', 'completed'])
});
