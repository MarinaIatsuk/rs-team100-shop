# Полка — командный проект RS School

Интернет-магазин предметов для дома: страница «О нас», каталог с поиском и фильтрами, корзина с подсчётом суммы и скидками.

Проект делают два человека: 
каталог и интерфейс - ([@MarinaIatsuk](https://github.com/MarinaIatsuk)), 
корзину и хранение реализует [@qkiws] (https://github.com/никГитХаба)

**Деплой:** добавь ссылку после первого запуска workflow — `https://marinaiatsuk.github.io/rs-team-shop/`

## Стек

- **Vite** - dev-сервер и сборка
- **TypeScript** (strict) - типизация логики и UI
- **Vanilla DOM** — без фреймворка
- **Vitest** — unit-тесты чистой логики
- **GitHub Actions + Pages** — CI и деплой

## Запуск

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # 14 тестов: каталог и роутер
npm run typecheck
npm run build      # dist/
```

## Структура

```text
src/
  data/products.ts        каталог товаров (локальные данные)
  domain/catalog.ts       поиск, фильтр по категории, сортировка
  domain/cart.ts          корзина — заглушка, реализует напарник
  domain/store.ts         состояние корзины — заглушка, реализует напарник
  router.ts               hash-роутер: «О нас», «Каталог», «Корзина»
  ui/element.ts           безопасное создание DOM без innerHTML
  ui/header.ts            шапка, навигация, счётчик товаров
  ui/product-card.ts      карточка товара
  ui/pages/about.ts       стартовая страница «О нас»
  ui/pages/catalog.ts     каталог
  ui/pages/cart.ts        корзина
  main.ts                 точка входа: роутер + стор + рендер
```

 слой `domain` не знает про DOM, поэтому логика тестируется в Node без браузера.


Подробное задание с контрактом функций: [docs/PARTNER_TASKS.md](docs/PARTNER_TASKS.md). Доска задач: [docs/BOARD.md](docs/BOARD.md). Архитектура и обоснование решений: [ARCHITECTURE.md](ARCHITECTURE.md).
