# STRUCTURE.md — карта файлов проекта

> Состояние на 14.11.2026. Контекст агента — `AGENTS.md`. Продукт — `PROJECT_SPEC.md`. Деплой — `.docs/deploy-vercel.md`.

## Корень

| Путь                                     | Назначение                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `package.json`                           | Скрипты монорепо: `dev`, `build`, `lint`, `format`, `typecheck`, `ci:check`, `db:*` |
| `pnpm-workspace.yaml`                    | `apps/*`, `packages/*` + `onlyBuiltDependencies`                                    |
| `turbo.json`                             | Пайплайны Turborepo (`build` → `dist/**`)                                           |
| `vercel.json`                            | Деплой SPA + Node Function `/api`                                                   |
| `api/[[...route]].ts`                    | Vercel: тот же Hono, что `apps/api`                                                 |
| `eslint.config.mjs` / `.prettierrc.json` | Lint / format                                                                       |
| `.env.example`                           | Шаблон env (БД, Supabase, Redis, бот)                                               |
| `AGENTS.md`                              | Правила агента, контракты, roadmap                                                  |
| `PROJECT_SPEC.md`                        | Короткий снимок продукта и стека                                                    |
| `REVIEW.md`                              | Чек-лист код-ревью                                                                  |
| `STRUCTURE.md`                           | Карта файлов (этот файл)                                                            |
| `.docs/`                                 | Спринты, backlog, [подключение Supabase](supabase-setup.md), deploy                 |
| `.cursor/hooks.json`                     | Хук после закрытия спринта → `.docs/sprints/NN-changes.md`                          |

## apps/

| Папка      | Назначение                                                            |
| ---------- | --------------------------------------------------------------------- |
| `apps/web` | Vite 6 + React 19 + react-router 7 + Tailwind 4 + RTK, FSD, порт 5173 |
| `apps/api` | Hono 4 + Prisma/Redis, порт 4000, `basePath /api`                     |
| `apps/bot` | grammY + Mini App `/tma`: меню, корзина, телефон на заказе, поллер    |

### apps/web (FSD)

| Путь                                                                                | Назначение                                               |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `app/main.tsx`, `router.tsx`, `store/`, `styles/`                                   | Вход, маршруты, Redux, дизайн-система                    |
| `pages/home\|menu\|menu-item\|booking\|checkout\|tma\|staff`                        | Страницы; staff — логин и заглушки вкладок               |
| `widgets/hero-showcase`, `menu-item-viewer`, `hall-map`, `app-header`, `app-footer`, `tma-shell` | Крупные блоки; Mini App — нижние вкладки          |
| `features/cart`, `book-table`, `menu-customizer`, `coffee-builder`, `staff-auth`    | Сценарии; `RequireStaff` на `/staff/*`                   |
| `entities/menu-item`                                                                | `menuApi`, `MenuItemCard`, `DrinkPhoto`, `LayerStackSvg` |
| `entities/table`, `entities/order`                                                  | Бронь / заказы (RTK Query)                               |
| `shared/api/baseApi.ts`                                                             | `baseUrl: /api`, `x-guest-id`                            |
| `shared/lib/drink-image.ts`, `data-fallback.ts`, `safe-error-message.ts`            | Фото, мок-фолбэк, prod-safe ошибки                       |
| `shared/ui/ScrollToTop.tsx`                                                         | Скролл вверх при смене маршрута                          |
| `public/drinks/`                                                                    | JPG/PNG + `overlays/*.svg`                               |

### apps/api

| Путь                   | Назначение                                                    |
| ---------------------- | ------------------------------------------------------------- |
| `src/app.ts`, `index.ts`, `vercel-handler.ts` | Hono app; listen :4000; адаптер Vercel      |
| `src/routes/menu.ts`   | `GET /menu` (+ мок при сбое БД)                               |
| `src/routes/tables.ts` | статусы / hold / unlock, слот 120 минут                      |
| `src/routes/orders.ts` | create / status / `?number=` / trigger                        |
| `src/routes/bot.ts`    | профиль Telegram, напоминания за 15 мин, ack                  |
| `src/lib/bot-auth.ts`  | заголовок `x-bot-secret`                                      |
| `src/routes/auth.ts`   | `POST /auth/login`, `GET /auth/me`                            |
| `src/lib/staff-auth.ts` | JWT персонала, bcrypt                                        |
| `src/lib/broadcast.ts` | Supabase Realtime (`SUPABASE_*` → `VITE_*` → `NEXT_PUBLIC_*`) |

## packages/

| Пакет                     | Назначение                                      |
| ------------------------- | ----------------------------------------------- |
| `@repo/shared`            | Типы, Zod, `price-calculator`, моки меню/столов |
| `@repo/database`          | Prisma schema/client, redis-локи, mappers, seed |
| `@repo/typescript-config` | `base.json`, `react.json`, `node.json`          |
