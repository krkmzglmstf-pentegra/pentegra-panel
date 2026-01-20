import { describe, expect, it } from 'vitest';
import { haversineDistanceMeters } from '../packages/shared/src/utils/haversine';

describe('haversine', () => {
  it('calculates distance roughly', () => {
    const distance = haversineDistanceMeters(41.0082, 28.9784, 39.9334, 32.8597);
    expect(distance).toBeGreaterThan(300000);
    expect(distance).toBeLessThan(500000);
  });
});
