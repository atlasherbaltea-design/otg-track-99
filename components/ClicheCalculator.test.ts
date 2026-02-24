
import { describe, it, expect } from 'vitest';

// Pure function logic extracted for testing
const calculateCost = (laize: number, cope: number, qty: number, price: number) => {
    const area = (laize / 1000) * (cope / 1000);
    return Math.round(area * qty * price);
};

describe('Cliche Cost Formula', () => {
  it('should match the standard example (403x1325, Qty 2, Price 2900)', () => {
    const result = calculateCost(403, 1325, 2, 2900);
    expect(result).toBe(3097);
  });

  it('should handle large dimensions correctly', () => {
    const result = calculateCost(1000, 1000, 1, 1000); // 1m x 1m x 1 x 1000
    expect(result).toBe(1000);
  });
});
