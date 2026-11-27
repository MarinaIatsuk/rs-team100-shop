export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartTotals {
  itemsCount: number;
  subtotal: number;
  discount: number;
  total: number;
  discountPercent: number;
}

export function addItem(
  lines: readonly CartLine[],
  productId: string,
  products: readonly { id: string }[],
): CartLine[] {
  if (!products.some((product) => product.id === productId)) {
    throw new Error(`Unknown product: ${productId}`);
  }

  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    return setQuantity(lines, productId, existing.quantity + 1);
  }

  return [...lines, { productId, quantity: 1 }];
}

export function removeItem(lines: readonly CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function setQuantity(
  lines: readonly CartLine[],
  productId: string,
  quantity: number,
): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError('Quantity must be a non-negative integer');
  }
  if (quantity === 0) {
    return removeItem(lines, productId);
  }

  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: Math.min(quantity, 99) } : line,
  );
}

export function countItems(lines: readonly CartLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}



// TODO: После согласования правил добавить действующие промокоды и скидки.
// Пока скидка равна 0, а любой непустой промокод отклоняется.
export function getDiscountPercent(promoCode = ''): number {
  if (promoCode.trim()) {
    throw new Error('Unknown promo code');
  }
  return 0;
}

// TODO: После определения правил скидок обновить расчёт и тесты при необходимости.
export function calculateTotals(
  lines: readonly CartLine[],
  products: readonly { id: string; price: number }[],
  promoCode = '',
): CartTotals {
  const discountPercent = getDiscountPercent(promoCode);
  const subtotal = lines.reduce((sum, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      throw new RangeError('Cart quantity must be an integer between 1 and 99');
    }
    const product = products.find((item) => item.id === line.productId);
    if (!product) {
      throw new Error(`Unknown product: ${line.productId}`);
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new RangeError(`Invalid price for product: ${line.productId}`);
    }
    return sum + product.price * line.quantity;
  }, 0);
  const discount = subtotal * discountPercent / 100;
  return {
    itemsCount: countItems(lines),
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    discountPercent,
  };
}
