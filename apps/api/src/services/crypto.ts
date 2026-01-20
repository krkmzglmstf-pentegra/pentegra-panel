function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function encryptJson(masterKeyBase64: string, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyBytes = base64ToBytes(masterKeyBase64);
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded));
  const payload = new Uint8Array(iv.length + ciphertext.length);
  payload.set(iv, 0);
  payload.set(ciphertext, iv.length);
  return bytesToBase64(payload);
}

export async function decryptJson<T>(masterKeyBase64: string, ciphertextBase64: string): Promise<T> {
  const payload = base64ToBytes(ciphertextBase64);
  const iv = payload.slice(0, 12);
  const ciphertext = payload.slice(12);
  const keyBytes = base64ToBytes(masterKeyBase64);
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const decoded = new TextDecoder().decode(plaintext);
  return JSON.parse(decoded) as T;
}

export function maskSecret(value: string): string {
  if (value.length <= 6) {
    return '***';
  }
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}
