import type { D1Database, Queue, DurableObjectNamespace } from '@cloudflare/workers-types';

export type Env = {
  DB: D1Database;
  ORDER_QUEUE: Queue;
  TOKEN_BROKER: DurableObjectNamespace;
  TENANT_DISPATCHER: DurableObjectNamespace;
  STREAM: DurableObjectNamespace;
  JWT_SECRET: string;
  CRED_MASTER_KEY_BASE64: string;
  GETIR_GLOBAL_X_API_KEY?: string;
  GETIR_GLOBAL_BASIC_AUTH?: string;
  MIGROS_GLOBAL_BASIC_AUTH?: string;
  LOG_LEVEL?: string;
};

export type AuthContext = {
  userId: string;
  role: 'admin' | 'ops' | 'restaurant' | 'courier';
  tenantId?: string;
  restaurantId?: string;
};
