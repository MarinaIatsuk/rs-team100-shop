import { describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY, loadCart, parseCart, saveCart } from '../src/domain/storage';

const products = [{ id: 'mug' }, { id: 'lamp' }];
const lines = [{ productId: 'mug', quantity: 2 }];

describe('cart storage', () => {
  it('saves and restores the cart', () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify(lines)),
      setItem: vi.fn(),
    };

    saveCart(storage, lines, products);
    expect(storage.setItem).toHaveBeenCalledWith(CART_STORAGE_KEY, JSON.stringify(lines));
    expect(loadCart(storage, products)).toEqual(lines);
    expect(storage.getItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
  });

  it('restores an empty cart for missing or empty saved data', () => {
    expect(parseCart(null, products)).toEqual([]);
    expect(parseCart('[]', products)).toEqual([]);
  });

  it('reports corrupt JSON and invalid cart shapes', () => {
    expect(() => parseCart('{', products)).toThrow('Invalid cart data');
    expect(() => parseCart('{}', products)).toThrow('Invalid cart data');
  });

  it('rejects unknown and duplicate products', () => {
    expect(() => parseCart('[{"productId":"unknown","quantity":1}]', products))
      .toThrow('Unknown product: unknown');
    expect(() => parseCart(JSON.stringify([...lines, ...lines]), products))
      .toThrow('Duplicate product: mug');
  });

  it.each([0, -1, 1.5, 100, '2', null])('rejects invalid quantity %s', (quantity) => {
    expect(() => parseCart(JSON.stringify([{ productId: 'mug', quantity }]), products))
      .toThrow('Invalid cart quantity');
  });

  it('propagates storage errors instead of claiming the cart was saved', () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error('read failed'); }),
      setItem: vi.fn(() => { throw new Error('write failed'); }),
    };
    expect(() => loadCart(storage, products)).toThrow('read failed');
    expect(() => saveCart(storage, lines, products)).toThrow('write failed');
  });
});
