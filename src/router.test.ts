import { describe, expect, it } from 'vitest';
import { parseRoute, routeToHash } from './router';

describe('parseRoute', () => {
  it('открывает «О нас» на пустом hash', () => {
    expect(parseRoute('')).toEqual({ name: 'about' });
  });

  it('распознаёт корень', () => {
    expect(parseRoute('#/')).toEqual({ name: 'about' });
  });

  it('распознаёт каталог и корзину', () => {
    expect(parseRoute('#/catalog')).toEqual({ name: 'catalog' });
    expect(parseRoute('#/cart')).toEqual({ name: 'cart' });
  });

  it('неизвестный маршрут отправляет на «О нас»', () => {
    expect(parseRoute('#/unknown')).toEqual({ name: 'about' });
  });
});

describe('routeToHash', () => {
  it('возвращает hash для каждой страницы', () => {
    expect(routeToHash('about')).toBe('#/');
    expect(routeToHash('catalog')).toBe('#/catalog');
    expect(routeToHash('cart')).toBe('#/cart');
  });
});
