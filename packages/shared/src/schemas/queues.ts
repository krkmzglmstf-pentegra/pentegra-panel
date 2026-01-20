import { z } from 'zod';
import { PlatformSchema } from './webhooks';

export const OrderIngestMessageSchema = z.object({
  type: z.literal('ORDER_INGEST'),
  platform: PlatformSchema,
  eventType: z.string(),
  receivedAt: z.string(),
  payload: z.unknown(),
  integrationId: z.string(),
  restaurantId: z.string(),
  tenantId: z.string()
});

export const OrderAutoApproveMessageSchema = z.object({
  type: z.literal('ORDER_AUTO_APPROVE'),
  platform: PlatformSchema,
  orderId: z.string(),
  integrationId: z.string(),
  tenantId: z.string(),
  attempt: z.number()
});

export const OrderAutoAssignMessageSchema = z.object({
  type: z.literal('ORDER_AUTO_ASSIGN'),
  tenantId: z.string(),
  orderId: z.string()
});

export const QueueMessageSchema = z.union([
  OrderIngestMessageSchema,
  OrderAutoApproveMessageSchema,
  OrderAutoAssignMessageSchema
]);

export type QueueMessage = z.infer<typeof QueueMessageSchema>;
