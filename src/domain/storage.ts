import type { CartLine } from './cart';

export const CART_STORAGE_KEY = 'cart';

export type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function parseCart(
  raw: string | null,
  products: readonly { id: string }[],
): CartLine[] {
  if (raw === null) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid cart data: malformed JSON', { cause: error });
    }
    throw error;
  }

  if (!Array.isArray(data)) throw new Error('Invalid cart data: expected an array');

  const ids = new Set(products.map((product) => product.id));
  const seen = new Set<string>();
  return data.map((item: unknown) => {
    if (typeof item !== 'object' || item === null || !('productId' in item) ||
        typeof item.productId !== 'string' || !('quantity' in item)) {
      throw new Error('Invalid cart data: invalid item');
    }
    if (!ids.has(item.productId)) throw new Error(`Unknown product: ${item.productId}`);
    if (seen.has(item.productId)) throw new Error(`Duplicate product: ${item.productId}`);
    if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) ||
        item.quantity < 1 || item.quantity > 99) {
      throw new Error(`Invalid cart quantity for product: ${item.productId}`);
    }
    seen.add(item.productId);
    return { productId: item.productId, quantity: item.quantity };
  });
}

export function loadCart(storage: CartStorage, products: readonly { id: string }[]): CartLine[] {
  return parseCart(storage.getItem(CART_STORAGE_KEY), products);
}

export function saveCart(
  storage: CartStorage,
  lines: readonly CartLine[],
  products: readonly { id: string }[],
): void {
  const raw = JSON.stringify(lines);
  parseCart(raw, products);
  storage.setItem(CART_STORAGE_KEY, raw);
}
