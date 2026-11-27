import { describe, expect, it, vi } from 'vitest';
import { CartStore } from '../src/domain/store';

const products = [
  { id: 'mug', title: 'Mug', price: 100 },
  { id: 'lamp', title: 'Lamp', price: 250 },
];

function createStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => { value = next; }),
  };
}

describe('CartStore', () => {
  it('loads persisted items, calculates totals and saves changes', () => {
    const storage = createStorage('[{"productId":"mug","quantity":2}]');
    const store = new CartStore(products, storage);
    expect(store.getState().totals.total).toBe(200);
    store.addItem('lamp');
    expect(store.getState().totals.total).toBe(450);
    expect(JSON.parse(storage.setItem.mock.calls[0]?.[1] ?? '')).toEqual([
      { productId: 'mug', quantity: 2 },
      { productId: 'lamp', quantity: 1 },
    ]);
  });

  it('notifies subscribers and supports unsubscription', () => {
    const store = new CartStore(products, createStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.addItem('mug');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0].lines).toEqual([{ productId: 'mug', quantity: 1 }]);
    unsubscribe();
    store.removeItem('mug');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('changes quantities, removes and clears items', () => {
    const store = new CartStore(products, createStorage());
    store.addItem('mug');
    store.setQuantity('mug', 2);
    expect(store.getState().totals.itemsCount).toBe(2);
    store.setQuantity('mug', 0);
    expect(store.getState().lines).toEqual([]);
    store.addItem('lamp');
    store.clear();
    expect(store.getState().lines).toEqual([]);
  });

  it('does not expose mutable state', () => {
    const store = new CartStore(products, createStorage());
    store.addItem('mug');
    const state = store.getState();
    state.lines[0]!.quantity = 50;
    state.lines.push({ productId: 'lamp', quantity: 1 });
    expect(store.getState().totals.itemsCount).toBe(1);
    expect(store.getState().lines).toEqual([{ productId: 'mug', quantity: 1 }]);
  });

  it('keeps state unchanged and does not notify if saving fails', () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => { throw new Error('write failed'); });
    const store = new CartStore(products, storage);
    const listener = vi.fn();
    store.subscribe(listener);
    expect(() => store.addItem('mug')).toThrow('write failed');
    expect(store.getState().lines).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
  });

  it('rejects unknown promo codes without changing state', () => {
    const store = new CartStore(products, createStorage());
    expect(() => store.applyPromoCode('UNKNOWN')).toThrow('Unknown promo code');
    expect(store.getState().promoCode).toBe('');
  });
});
