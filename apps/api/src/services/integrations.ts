import type { D1Database } from '@cloudflare/workers-types';
import { decryptJson } from './crypto';
import type { Env } from '../types';

export type IntegrationRecord = {
  id: string;
  restaurant_id: string;
  platform: 'getir' | 'migros' | 'yemeksepeti';
  platform_restaurant_id: string;
  inbound_auth_ciphertext: string | null;
  outbound_cred_ciphertext: string | null;
  auto_approve: number;
  auto_print: number;
};

export async function getIntegrationByPlatformId(
  db: D1Database,
  platform: string,
  platformRestaurantId: string
): Promise<IntegrationRecord | null> {
  const result = await db
    .prepare(
      'SELECT * FROM restaurant_integrations WHERE platform = ? AND platform_restaurant_id = ?'
    )
    .bind(platform, platformRestaurantId)
    .first<IntegrationRecord>();
  return result ?? null;
}

export async function getInboundAuth(
  env: Env,
  integration: IntegrationRecord
): Promise<Record<string, unknown> | null> {
  if (!integration.inbound_auth_ciphertext) {
    return null;
  }
  return decryptJson<Record<string, unknown>>(env.CRED_MASTER_KEY_BASE64, integration.inbound_auth_ciphertext);
}

export async function getOutboundCreds(
  env: Env,
  integration: IntegrationRecord
): Promise<Record<string, unknown> | null> {
  if (!integration.outbound_cred_ciphertext) {
    return null;
  }
  return decryptJson<Record<string, unknown>>(env.CRED_MASTER_KEY_BASE64, integration.outbound_cred_ciphertext);
}

export function verifyBasicAuth(headerValue: string | null, expected: string | undefined): boolean {
  if (!expected) {
    return false;
  }
  if (!headerValue?.startsWith('Basic ')) {
    return false;
  }
  const base64 = headerValue.slice('Basic '.length);
  const decoded = atob(base64);
  return decoded === expected;
}

export function verifyApiKey(headerValue: string | null, expected: string | undefined): boolean {
  if (!expected) {
    return false;
  }
  return headerValue === expected;
}
