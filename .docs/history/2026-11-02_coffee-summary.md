# Итоги сессии: Кофейня — Фаза 1, инициализация монорепозитория

Дата: 2026-11-02

## 📌 Что было сделано

- [x] Подтверждена архитектура проекта «Tactile Craft Coffee & Bakery» (3D-меню Exploded View, 3D-карта столов, Telegram-бот) и зафиксирован roadmap из 5 фаз.
- [x] Поднят скелет монорепозитория Turborepo (pnpm workspaces): корневые `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.env.example`, `.gitignore`.
- [x] Создан пакет `@repo/typescript-config` с базовыми tsconfig (base / nextjs / node).
- [x] Создан пакет `@repo/shared`: строгие TS-типы для 3D-меню и realtime-событий, Zod-схемы (бронирование, заказ, адрес + полигон доставки с ray-casting проверкой), чистый калькулятор цены/КБЖУ по активным слоям, моковые данные меню — 4 блюда с полной раскладкой по 3D-слоям (латте, матча-клубника, малиновый тирамису, миндальный круассан).
- [x] Создан пакет `@repo/database`: полная Prisma-схема PostgreSQL (8 моделей, 6 enum'ов), singleton PrismaClient с патчем сериализации BigInt, клиент Upstash Redis с атомарными локами столов `lock:table:{id}:{slot}` (SET NX EX, TTL 10 мин), идемпотентный seed (категории, блюда со слоями, 10 столиков с 3D-координатами).
- [x] Скелеты приложений: `apps/web` (Next.js 15 + React 19 + Tailwind 4, smoke-страница, читающая моки из `@repo/shared` через калькулятор цен) и `apps/bot` (grammY, smoke-хендлер `/start`, заменяется в Фазе 5).
- [ ] ⚠️ `pnpm install` **прерван пользователем** на ~100 сек — зависимости не установлены, типы и схема Prisma не проверены компилятором.

## 📂 Измененные файлы и компоненты

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.env.example`, `.gitignore` — корневая конфигурация монорепо.
- `packages/typescript-config/{base,nextjs,node}.json` + `package.json` — общие настройки компилятора.
- `packages/shared/src/types/three-menu.types.ts` — типы `MenuItem3DConfig`, `MenuItemLayerConfig`, `CameraPreset`, `CustomConfiguration`.
- `packages/shared/src/types/realtime.types.ts` — пейлоады событий столов и заказов для Supabase Realtime.
- `packages/shared/src/schemas/{booking,order,address}.schema.ts` — Zod-валидация холда стола, корзины с кастомизацией слоёв, адресов и полигона доставки.
- `packages/shared/src/utils/price-calculator.ts` — `calculateItemTotals`, `getDefaultActiveLayerIds`, `buildConfiguration` (единый источник правды для фронта, API и бота).
- `packages/shared/src/mocks/menu.mock.ts` — типизированные моки меню со слоями (стабильные ID, общие с сидом БД).
- `packages/database/prisma/schema.prisma` — схема БД по спецификации (User, Address, Category, MenuItem, MenuItemLayer, CafeTable, Booking, Order, OrderItem).
- `packages/database/src/client.ts` — PrismaClient singleton + `BigInt.prototype.toJSON` для `telegramId`.
- `packages/database/src/redis.ts` — `lockTable` / `unlockTable` / `getTableLocks` с защитой от снятия чужого лока.
- `packages/database/seed.ts` — сид из моков + 10 столиков (window / center / quiet / terrace).
- `apps/web/` — `package.json`, `next.config.mjs` (transpilePackages), tsconfig, Tailwind 4 (postcss), `layout.tsx`, smoke-страница `(showcase)/page.tsx`.
- `apps/bot/` — `package.json` (grammY + conversations + menu), tsconfig, `src/index.ts` (smoke-бот; без `BOT_TOKEN` завершается с подсказкой).

## 🔌 Интеграции и данные

- **Supabase PostgreSQL** — схема готова к `prisma db push`; нужны `DATABASE_URL` / `DIRECT_URL` в `.env` (шаблон в `.env.example`).
- **Upstash Redis** — контракт ключей и TTL зафиксирован; клиент лениво инициализируется и падает с понятной ошибкой без env-переменных.
- **Telegram Bot API** — точка входа готова, ждёт `BOT_TOKEN`.
- Исправление по ходу: убрана зависимость `@grammyjs/storage-upstash` (пакет отсутствует в npm, 404); выбор Redis-адаптера сессий перенесён в Фазу 5.

## 🚀 Следующие шаги

1. Довести до конца `pnpm install` в корне монорепо (был прерван).
2. Валидация: `pnpm --filter @repo/database db:generate` (проверит schema.prisma) и `pnpm lint` (tsc --noEmit по всем пакетам).
3. Smoke-тест: `pnpm --filter @repo/web dev` — главная должна отрендерить мок-меню с расчётом цены/КБЖУ.
4. Поднять Supabase-проект и Upstash, заполнить `.env`, выполнить `pnpm db:push` + `pnpm db:seed`.
5. Далее — **Фаза 2**: Redux Toolkit store, `menuApi` / `bookingApi` / `orderApi` (с `onCacheEntryAdded` для Realtime), слайсы `scene3dSlice` / `customizerSlice` / `cartSlice`.
