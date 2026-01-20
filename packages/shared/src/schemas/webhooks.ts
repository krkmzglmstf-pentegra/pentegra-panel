import { z } from 'zod';

export const PlatformSchema = z.enum(['getir', 'migros', 'yemeksepeti']);

export const GetirNewOrderSchema = z.object({
  id: z.string(),
  restaurant: z.object({ id: z.string() })
}).passthrough();

export const GetirCancelOrderSchema = z.object({
  id: z.string(),
  restaurant: z.object({ id: z.string() })
}).passthrough();

export const MigrosOrderCreatedSchema = z.object({
  id: z.string(),
  store: z.object({ id: z.string() }),
  status: z.string().optional(),
  deliveryProvider: z.string().optional()
}).passthrough();

export const MigrosOrderCanceledSchema = z.object({
  OrderId: z.string(),
  StoreId: z.string()
}).passthrough();

export const MigrosDeliveryStatusChangedSchema = z.object({
  orderId: z.string(),
  storeId: z.string(),
  deliveryStatus: z.string()
}).passthrough();

export const YemeksepetiWebhookSchema = z.record(z.string(), z.unknown());
