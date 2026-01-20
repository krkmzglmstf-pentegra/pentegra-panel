import { createCipheriv } from 'crypto';

function toKeyBytes(secretKey: string): Buffer {
  if (/^[A-Za-z0-9+/=]+$/.test(secretKey) && secretKey.length >= 44) {
    return Buffer.from(secretKey, 'base64');
  }
  return Buffer.from(secretKey, 'utf8');
}

export function migrosEncrypt(jsonText: string, secretKey: string): string {
  const key = toKeyBytes(secretKey);
  if (key.length !== 32) {
    throw new Error('Migros secret key must be 32 bytes');
  }
  const cipher = createCipheriv('aes-256-ecb', key, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(jsonText, 'utf8'), cipher.final()]);
  return encrypted.toString('base64');
}

export async function migrosPostEncrypted(
  baseUrl: string,
  path: string,
  restaurantApiKey: string,
  secretKey: string,
  body: unknown
): Promise<Response> {
  const payload = JSON.stringify(body);
  const value = migrosEncrypt(payload, secretKey);
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      XApiKey: restaurantApiKey
    },
    body: JSON.stringify({ value })
  });
}

export async function migrosPostPlain(
  baseUrl: string,
  path: string,
  headers: Record<string, string>,
  body: unknown
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
}
