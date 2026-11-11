# STRUCTURE.md — карта файлов проекта

> Состояние на 10.11.2026. Подробный контекст агентов — в `AGENTS.md`. Деплой — `.docs/deploy-vercel.md`.

## Корень

| Путь                                     | Назначение                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `package.json`                           | Скрипты монорепо: `dev`, `build`, `lint`, `format`, `typecheck`, `ci:check`, `db:*` |
| `pnpm-workspace.yaml`                    | `apps/*`, `packages/*` + `onlyBuiltDependencies`                                    |
| `turbo.json`                             | Пайплайны Turborepo (`build` → `dist/**`)                                           |
| `vercel.json`                            | Деплой SPA `@repo/web` на Vercel                                                    |
| `eslint.config.mjs` / `.prettierrc.json` | Lint / format                                                                       |
| `.env.example`                           | Шаблон env (БД, Supabase, Redis, бот)                                               |
| `AGENTS.md`                              | Архитектура, контракты, roadmap                                                     |
| `REVIEW.md`                              | Чек-лист для код-ревью и субагента arch-reviewer                                    |
| `STRUCTURE.md`                           | Карта файлов проекта (этот файл)                                                    |
| `.docs/`                                 | Memory спринта, backlog, история, deploy-заметки                                    |

## apps/

| Папка      | Назначение                                                            |
| ---------- | --------------------------------------------------------------------- |
| `apps/web` | Vite 6 + React 19 + react-router 7 + Tailwind 4 + RTK, FSD, порт 5173 |
| `apps/api` | Hono 4 + Prisma/Redis, порт 4000, `basePath /api`                     |
| `apps/bot` | grammY-скелет (Фаза 5)                                                |

### apps/web (FSD)

| Путь                                                                                | Назначение                                               |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `app/main.tsx`, `router.tsx`, `store/`, `styles/`                                   | Вход, маршруты, Redux, дизайн-система                    |
| `pages/home\|menu\|menu-item\|booking\|checkout\|tma`                               | Страницы                                                 |
| `widgets/hero-showcase`, `menu-item-viewer`, `hall-map`, `app-header`, `app-footer` | Крупные блоки                                            |
| `features/cart`, `book-table`, `menu-customizer`, `coffee-builder`                  | Сценарии                                                 |
| `entities/menu-item`                                                                | `menuApi`, `MenuItemCard`, `DrinkPhoto`, `LayerStackSvg` |
| `entities/table`, `entities/order`                                                  | Бронь / заказы (RTK Query)                               |
| `shared/api/baseApi.ts`                                                             | `baseUrl: /api`, `x-guest-id`                            |
| `shared/lib/drink-image.ts`, `data-fallback.ts`, `safe-error-message.ts`            | Фото, мок-фолбэк, prod-safe ошибки                       |
| `shared/ui/ScrollToTop.tsx`                                                         | Скролл вверх при смене маршрута                          |
| `public/drinks/`                                                                    | JPG/PNG + `overlays/*.svg`                               |

### apps/api

| Путь                   | Назначение                                                    |
| ---------------------- | ------------------------------------------------------------- |
| `src/index.ts`         | Hono app, cors, logger, `/health`                             |
| `src/routes/menu.ts`   | `GET /menu` (+ мок при сбое БД)                               |
| `src/routes/tables.ts` | статусы / hold / unlock                                       |
| `src/routes/orders.ts` | create / status / trigger                                     |
| `src/lib/broadcast.ts` | Supabase Realtime (`SUPABASE_*` → `VITE_*` → `NEXT_PUBLIC_*`) |

## packages/

| Пакет                     | Назначение                                      |
| ------------------------- | ----------------------------------------------- |
| `@repo/shared`            | Типы, Zod, `price-calculator`, моки меню/столов |
| `@repo/database`          | Prisma schema/client, redis-локи, mappers, seed |
| `@repo/typescript-config` | `base.json`, `react.json`, `node.json`          |
