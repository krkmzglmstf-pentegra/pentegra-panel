import { SignJWT, jwtVerify } from 'jose';
import { JwtClaimsSchema, type JwtClaims } from '@pentegra/shared';

const PBKDF2_ITERATIONS = 120000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createPasswordHash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits'
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  const hashBytes = new Uint8Array(derived);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hashBytes)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterationsRaw, saltBase64, hashBase64] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterationsRaw || !saltBase64 || !hashBase64) {
    return false;
  }
  const iterations = Number(iterationsRaw);
  const salt = base64ToBytes(saltBase64);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits'
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );
  const hashBytes = new Uint8Array(derived);
  return bytesToBase64(hashBytes) === hashBase64;
}

export async function signJwt(secret: string, claims: JwtClaims): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(key);
}

export async function verifyJwt(secret: string, token: string): Promise<JwtClaims> {
  const key = new TextEncoder().encode(secret);
  const result = await jwtVerify(token, key, { algorithms: ['HS256'] });
  const parsed = JwtClaimsSchema.safeParse(result.payload);
  if (!parsed.success) {
    throw new Error('invalid token');
  }
  return parsed.data;
}
