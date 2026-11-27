import { describe, expect, it } from 'vitest';
import {
  addItem,
  calculateTotals,
  countItems,
  getDiscountPercent,
  removeItem,
  setQuantity,
} from '../src/domain/cart';

const products = [{ id: 'mug' }, { id: 'lamp' }];

describe('cart operations', () => {
  it('adds a known product without changing the original cart', () => {
    const lines = [{ productId: 'mug', quantity: 2 }];

    expect(addItem(lines, 'lamp', products)).toEqual([
      { productId: 'mug', quantity: 2 },
      { productId: 'lamp', quantity: 1 },
    ]);
    expect(lines).toEqual([{ productId: 'mug', quantity: 2 }]);
  });

  it('increments an existing product up to 99', () => {
    expect(addItem([{ productId: 'mug', quantity: 2 }], 'mug', products)).toEqual([
      { productId: 'mug', quantity: 3 },
    ]);
    expect(addItem([{ productId: 'mug', quantity: 99 }], 'mug', products)).toEqual([
      { productId: 'mug', quantity: 99 },
    ]);
  });

  it('rejects an unknown product', () => {
    expect(() => addItem([], 'unknown', products)).toThrow('Unknown product: unknown');
  });

  it('removes only the requested product', () => {
    const lines = [
      { productId: 'mug', quantity: 2 },
      { productId: 'lamp', quantity: 1 },
    ];

    expect(removeItem(lines, 'mug')).toEqual([{ productId: 'lamp', quantity: 1 }]);
    expect(lines).toHaveLength(2);
  });

  it('sets the quantity and caps it at 99', () => {
    const lines = [{ productId: 'mug', quantity: 1 }];

    expect(setQuantity(lines, 'mug', 4)).toEqual([{ productId: 'mug', quantity: 4 }]);
    expect(setQuantity(lines, 'mug', 100)).toEqual([{ productId: 'mug', quantity: 99 }]);
    expect(lines[0]?.quantity).toBe(1);
  });

  it('removes the product when its quantity is set to zero', () => {
    expect(setQuantity([{ productId: 'mug', quantity: 1 }], 'mug', 0)).toEqual([]);
  });

  it('rejects negative and non-integer quantities', () => {
    const lines = [{ productId: 'mug', quantity: 1 }];

    expect(() => setQuantity(lines, 'mug', -1)).toThrow(RangeError);
    expect(() => setQuantity(lines, 'mug', 1.5)).toThrow(RangeError);
    expect(() => setQuantity(lines, 'mug', NaN)).toThrow(RangeError);
  });
});

describe('countItems', () => {
  it('returns zero for an empty cart', () => {
    expect(countItems([])).toBe(0);
  });

  it('counts all units rather than distinct products', () => {
    expect(
      countItems([
        { productId: 'mug', quantity: 2 },
        { productId: 'lamp', quantity: 3 },
      ]),
    ).toBe(5);
  });
});

describe('cart totals', () => {
  it('calculates the quantity and cost of all products', () => {
    expect(
      calculateTotals(
        [{ productId: 'mug', quantity: 2 }, { productId: 'lamp', quantity: 3 }],
        [{ id: 'mug', price: 100 }, { id: 'lamp', price: 250 }],
      ),
    ).toEqual({ itemsCount: 5, subtotal: 950, discount: 0, total: 950, discountPercent: 0 });
  });

  it('returns zero totals for an empty cart', () => {
    expect(calculateTotals([], [])).toEqual({
      itemsCount: 0, subtotal: 0, discount: 0, total: 0, discountPercent: 0,
    });
  });

  it('reports an unknown product instead of calculating an incomplete total', () => {
    expect(() => calculateTotals([{ productId: 'missing', quantity: 1 }], []))
      .toThrow('Unknown product: missing');
  });

  it('rejects invalid quantities and prices', () => {
    expect(() => calculateTotals([{ productId: 'mug', quantity: -1 }], [{ id: 'mug', price: 1 }]))
      .toThrow(RangeError);
    expect(() => calculateTotals([{ productId: 'mug', quantity: 1 }], [{ id: 'mug', price: -1 }]))
      .toThrow(RangeError);
  });

  it('reports unknown promo codes until discount rules are defined', () => {
    expect(getDiscountPercent('')).toBe(0);
    expect(() => getDiscountPercent('UNKNOWN')).toThrow('Unknown promo code');
    expect(() => calculateTotals([], [], 'UNKNOWN')).toThrow('Unknown promo code');
  });
});
