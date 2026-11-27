import type { Category, CatalogQuery, Product, SortOption } from '../types';

export const CATEGORY_LABELS: Readonly<Record<Category, string>> = {
  lamps: 'Свет',
  textile: 'Текстиль',
  ceramics: 'Керамика',
  paper: 'Бумага',
};

export const SORT_LABELS: Readonly<Record<SortOption, string>> = {
  popular: 'По популярности',
  'price-asc': 'Сначала дешёвые',
  'price-desc': 'Сначала дорогие',
};

export function searchProducts(products: readonly Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...products];

  return products.filter((product) =>
    `${product.title} ${product.description}`.toLowerCase().includes(normalized),
  );
}

export function filterByCategory(
  products: readonly Product[],
  category: Category | 'all',
): Product[] {
  if (category === 'all') return [...products];
  return products.filter((product) => product.category === category);
}

export function sortProducts(products: readonly Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'popular':
    default:
      return sorted.sort((a, b) => b.rating - a.rating);
  }
}

export function selectProducts(products: readonly Product[], query: CatalogQuery): Product[] {
  const filtered = filterByCategory(products, query.category);
  return sortProducts(searchProducts(filtered, query.search), query.sort);
}
