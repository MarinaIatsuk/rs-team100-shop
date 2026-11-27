export type RouteName = 'about' | 'catalog' | 'cart';

export interface Route {
  name: RouteName;
}

const ROUTES: Readonly<Record<string, RouteName>> = {
  '': 'about',
  '/': 'about',
  '/about': 'about',
  '/catalog': 'catalog',
  '/cart': 'cart',
};

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  return { name: ROUTES[path] ?? 'about' };
}

export function routeToHash(name: RouteName): string {
  return name === 'about' ? '#/' : `#/${name}`;
}

export function navigate(name: RouteName): void {
  window.location.hash = routeToHash(name);
}
