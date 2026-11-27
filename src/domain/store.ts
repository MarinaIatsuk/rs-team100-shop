import {
  addItem,
  calculateTotals,
  getDiscountPercent,
  removeItem,
  setQuantity,
} from './cart';
import type { CartLine, CartTotals } from './cart';
import { loadCart, saveCart } from './storage';
import type { CartStorage } from './storage';

export interface CartProduct {
  id: string;
  price: number;
}

export interface CartState {
  lines: CartLine[];
  promoCode: string;
  totals: CartTotals;
}

export class CartStore {
  private readonly products: CartProduct[];
  private lines: CartLine[];
  private promoCode = '';
  private readonly listeners = new Set<(state: CartState) => void>();

  constructor(products: readonly CartProduct[], private readonly storage: CartStorage) {
    this.products = products.map((product) => ({ ...product }));
    this.lines = loadCart(storage, this.products);
    calculateTotals(this.lines, this.products);
  }

  getState(): CartState {
    return {
      lines: this.lines.map((line) => ({ ...line })),
      promoCode: this.promoCode,
      totals: calculateTotals(this.lines, this.products, this.promoCode),
    };
  }

  subscribe(listener: (state: CartState) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  addItem(productId: string): void {
    this.updateLines(addItem(this.lines, productId, this.products));
  }

  removeItem(productId: string): void {
    this.updateLines(removeItem(this.lines, productId));
  }

  setQuantity(productId: string, quantity: number): void {
    this.updateLines(setQuantity(this.lines, productId, quantity));
  }

  clear(): void {
    this.updateLines([]);
  }

  // TODO: Проверить применение действующих промокодов тестами, когда появятся правила скидок.
  applyPromoCode(promoCode: string): void {
    const normalized = promoCode.trim();
    getDiscountPercent(normalized);
    this.promoCode = normalized;
    this.notify();
  }

  private updateLines(lines: CartLine[]): void {
    calculateTotals(lines, this.products, this.promoCode);
    saveCart(this.storage, lines, this.products);
    this.lines = lines;
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.getState());
  }
}
