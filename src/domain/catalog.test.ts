import { describe, expect, it } from 'vitest';
import { filterByCategory, searchProducts, selectProducts, sortProducts } from './catalog';
import type { Product } from '../types';

const make = (id: string, price: number, rating: number): Product => ({
  id,
  title: `Товар ${id}`,
  category: 'lamps',
  price,
  rating,
  emoji: '🛋️',
  description: 'описание',
});

const products: Product[] = [make('a', 300, 4.2), make('b', 100, 4.9), make('c', 200, 4.5)];

describe('searchProducts', () => {
  it('возвращает всё на пустой запрос', () => {
    expect(searchProducts(products, '   ')).toHaveLength(3);
  });

  it('ищет без учёта регистра', () => {
    expect(searchProducts(products, 'ТОВАР A').map((item) => item.id)).toEqual(['a']);
  });

  it('возвращает пустой массив, если ничего не найдено', () => {
    expect(searchProducts(products, 'холодильник')).toEqual([]);
  });
});

describe('filterByCategory', () => {
  it('не фильтрует при значении all', () => {
    expect(filterByCategory(products, 'all')).toHaveLength(3);
  });

  it('оставляет только выбранную категорию', () => {
    expect(filterByCategory(products, 'ceramics')).toEqual([]);
  });
});

describe('sortProducts', () => {
  it('сортирует по возрастанию цены', () => {
    expect(sortProducts(products, 'price-asc').map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('сортирует по убыванию цены', () => {
    expect(sortProducts(products, 'price-desc').map((item) => item.id)).toEqual(['a', 'c', 'b']);
  });

  it('сортирует по рейтингу и не мутирует исходный массив', () => {
    expect(sortProducts(products, 'popular').map((item) => item.id)).toEqual(['b', 'c', 'a']);
    expect(products.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('selectProducts', () => {
  it('применяет поиск, фильтр и сортировку вместе', () => {
    const result = selectProducts(products, { search: 'товар', category: 'lamps', sort: 'price-asc' });
    expect(result.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });
});
