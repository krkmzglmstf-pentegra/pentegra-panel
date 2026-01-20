import { describe, expect, it } from 'vitest';
import { migrosEncrypt } from '../apps/api/src/adapters/migros';

describe('migros aes-256-ecb', () => {
  it('matches known base64 vector', () => {
    const keyHex = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const key = Buffer.from(keyHex, 'hex').toString('base64');
    const plaintext = '{"orderId":"123","amount":45}';
    const expected = 'mFY0uOQsmtt2mUX5vasbMF5K9hJMEEGmIXf+c6912Cw=';
    const result = migrosEncrypt(plaintext, key);
    expect(result).toBe(expected);
  });
});
