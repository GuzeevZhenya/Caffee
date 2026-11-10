# AGENTS.md — Tactile Craft Coffee & Bakery

> Контекстный файл для агентов и новых участников. Читать первым при входе в проект.

## Что это за проект

Веб-приложение кофейни с тремя ядрами:

1. **Интерактивное меню по слоям** — каждое блюдо раскладывается на слои (`basePositionY`/`explodeOffsetY` в конфиге), на странице блюда — полномасштабное фото и «указатели» слоёв с названием, граммовкой и КБЖУ. Кастомизация слоёв (убрать/добавить) реактивно пересчитывает цену и калории через единый калькулятор.
2. **Карта бронирования столов** — защита от овербукинга через атомарный лок в Upstash Redis (`lock:table:{id}:{slot}`, TTL 10 минут) + realtime-рассылка статусов через Supabase Realtime (3D-диорама зала — в Фазе 4).
3. **Telegram-бот** — доставка (геолокация, полигон зоны), предзаказ к столику с триггером «🔥 Готовить сейчас» за 15 минут до брони.

## Структура монорепозитория (Turborepo + pnpm)

```
apps/
  web/        Vite 6 + React 19 + react-router 7 + Tailwind 4 + Redux Toolkit/RTK Query, FSD-архитектура
  api/        Hono 4 + @hono/node-server — HTTP API (порт 4000), единственное приложение с доступом к БД
  bot/        grammY (conversations, menu), smoke-скелет до Фазы 5
packages/
  shared/     @repo/shared — типы, Zod-схемы, калькулятор цены/КБЖУ, моки меню и столов
  database/   @repo/database — Prisma-схема, PrismaClient singleton, Redis-локи, seed, мапперы Decimal→number
  typescript-config/  общие tsconfig (base / react / node)
```

Пакеты `shared` и `database` отдаются как TS-исходники (без build-шага). Подробная карта всех файлов («что за что отвечает») — в `STRUCTURE.md`.

### Архитектурная граница web ↔ api

- **Web НЕ импортирует `@repo/database`** — весь доступ к данным только по HTTP через RTK Query (`@/shared/api/baseApi`).
- **API НЕ импортирует код из web** — shared пакеты являются общим слоем (типы, Zod, калькулятор, моки).
- Vite dev-сервер проксирует `/api → http://localhost:4000` (см. `apps/web/vite.config.ts`).

### FSD-структура `apps/web/src`

```
app/          точка входа (main.tsx), router.tsx, store/, providers/, styles/ (дизайн-система)
pages/        home/ menu/ menu-item/ booking/ checkout/ tma/ — композиция виджетов и фичей
widgets/      app-header/ app-footer/ hero-showcase/ menu-item-viewer/ — крупные самодостаточные блоки
features/     cart/ book-table/ menu-customizer/ coffee-builder/ — пользовательские сценарии
entities/     menu-item/ table/ order/ — бизнес-сущности (RTK Query API + UI)
shared/       api/ lib/ ui/ config/ — инфраструктура, не зависящая от бизнеса
```

**Дизайн-система** — в `app/styles/index.css` (Tailwind 4 `@theme`): палитра «вечерний эспрессо-бар» (ink-900…500, gold, cream, mint, rose-warm в OKLCH), шрифты Playfair Display + Manrope, зернистая текстура, компонентные классы `.btn`/`.card`/`.chip`/`.nav-pill`/`.eyebrow`/`.field-input`, анимации `--animate-cp-in` и `--animate-float`. Hero-фото — виджет `hero-showcase` + класс `.hero-center-photo`.

**Фото напитков** — `public/drinks/*.jpg` + маппинг `shared/lib/drink-image.ts` (по slug и по id; fallback — `LayerStackSvg`).

**Правила FSD:**

- Иерархия слоёв: `app > pages > widgets > features > entities > shared`. Импорты разрешены **только вниз** (слой выше может импортировать слой ниже, но не наоборот и не «вбок» на своём уровне — исключение: cross-import entities через публичное API).
- Внутри слайса — сегменты: `api/` (RTK Query эндпоинты), `model/` (Redux-слайсы, типы), `ui/` (компоненты), `lib/` (утилиты), `index.ts` (публичный API слайса).
- Импортировать слайс только через его `index.ts`; внутренние пути наружу не экспортируются.
- Алиас `@/` → `apps/web/src/` (vite + tsconfig paths).
- Слайсы фичей типизируют стейт через `import type { RootState } from "@/app/store"` — это намеренная type-only цикличность, рантайм-цикла нет.
- RTK Query API живут в entities (`entities/menu-item/api/menuApi.ts` и т.д.) и регистрируются в `app/store/index.ts` явными импортами (`import "@/entities/menu-item"`).

### API-роуты `apps/api`

| Метод и путь (basePath `/api`) | Назначение                                                             |
| ------------------------------ | ---------------------------------------------------------------------- |
| `GET /health`                  | healthcheck                                                            |
| `GET /menu`                    | меню из БД, фолбэк на MOCK при отсутствии `.env`                       |
| `GET /tables?date&slot`        | статусы столов на слот (FREE/HELD/OCCUPIED + Redis-локи)               |
| `POST /tables/hold`            | холд стола на 10 минут + broadcast в Supabase Realtime                 |
| `DELETE /tables/hold`          | снять холд (только свой)                                               |
| `POST /orders`                 | создать заказ; цена пересчитывается на сервере, клиентской не доверяем |
| `GET /orders?id=`              | статус заказа                                                          |
| `PATCH /orders/:id/trigger`    | триггер «Готовить сейчас»                                              |

- Идентификация гостя: заголовок `x-guest-id` (генерируется в `web/shared/lib/guest-id.ts`); гостевой пользователь в БД — `guest@tactile.local`.
- Порт берётся из `PORT` env (по умолчанию 4000).
- Без заполненного `.env` API работает в мок-режиме: `/menu` и `/tables` отдают моки, заказы и холды возвращают 503 (нет БД/Redis).

## Команды (корень)

| Команда                      | Что делает                                  |
| ---------------------------- | ------------------------------------------- |
| `pnpm dev`                   | dev-серверы web (5173) и api (4000) (turbo) |
| `pnpm build`                 | сборка                                      |
| `pnpm lint` / `lint:fix`     | ESLint (flat config, `eslint.config.mjs`)   |
| `pnpm format` / `format:fix` | Prettier check / write (`.prettierrc.json`) |
| `pnpm typecheck`             | `tsc --noEmit` по всем пакетам через turbo  |
| `pnpm ci:check`              | lint + typecheck + build                    |
| `pnpm db:generate`           | генерация Prisma Client                     |
| `pnpm db:push` / `db:seed`   | применить схему / наполнить БД              |

Проектные команды агента лежат в `.kimi-code/skills/`: `/формат` (полный цикл проверки кода), `/заключение` (отчёт сессии в `.docs/history/YYYY-MM-DD_coffee-summary.md`).

## Ключевые контракты

- **Единый источник правды для цены/КБЖУ** — `packages/shared/src/utils/price-calculator.ts`: `calculateItemTotals(item, activeLayerIds)`. Используется API (серверный пересчёт при создании заказа), фронтом (customizer) и ботом. Правила: `unitPrice = basePrice + Σ priceModifier активных слоёв`; удаление базового слоя не уменьшает цену; `baseCalories` блюда = надбавка поверх слоёв (в моках = 0, вся КБЖУ в слоях).
- **Слепок кастомизации** — `CustomConfiguration { activeLayerIds, removedTitles, addedTitles }` хранится в `OrderItem.customConfiguration` (JSON).
- **3D-конфиг слоя** — тип `MenuItemLayerConfig` в `packages/shared/src/types/three-menu.types.ts`: `basePositionY` (собрано), `explodeOffsetY` (разлёт), `heightScale`/`radiusScale` (процедурный примитив), `labelPosition` (выноска `<Html>`), материал (`colorHex`, `opacity`, `roughness`). Там же `MenuResponse` (контракт ответа API).
- **Fallback-рендер**: если `MenuItem.modelUrl === null` — слои рендерятся примитивами (`primitiveType`: CYLINDER/BOX/SPHERE/TORUS), .glb не нужны.
- **Локи столов** — `packages/database/src/redis.ts`: `lockTable/unlockTable/getTableLocks`, ключ `lock:table:{tableId}:{slotStartIso}`, TTL 600 сек; снять чужой лок нельзя (проверка `userId`). Слот брони — 90 минут.
- **Realtime-пейлоады и конфиг столов** — типы в `packages/shared/src/types/realtime.types.ts` (`TableStatusPayload`, `OrderStatusRealtimePayload`, `TableSlotStatus`, `HoldTableResponse`, `CafeTableConfig`, `TABLE_ZONES`). Подписка на канал `cafe-tables` — в `bookingApi.onCacheEntryAdded` (`entities/table`).
- **Типы ответов API** — `packages/shared/src/types/api.types.ts`: `CreateOrderResponse`, `OrderStatusResponse`, `ApiErrorResponse`.
- **Валидация** — Zod-схемы в `packages/shared/src/schemas/` (бронь, заказ, адрес + полигон доставки `isPointInDeliveryZone`). Одни и те же схемы на фронте, в API и в боте.
- **Мапперы БД → shared** — `packages/database/src/mappers.ts`: Decimal→Number, JSON→типизированные кортежи (с runtime-гардами). API возвращает только shared-типы, никаких Prisma-объектов наружу.

## База данных

Схема: `packages/database/prisma/schema.prisma` — 8 моделей (`User`, `Address`, `Category`, `MenuItem`, `MenuItemLayer`, `CafeTable`, `Booking`, `Order`, `OrderItem`), 6 enum'ов. `User.telegramId` — BigInt (в `client.ts` патч `BigInt.prototype.toJSON`). Seed: `packages/database/seed.ts` (идемпотентный, берёт меню из `@repo/shared` моков).

Seed берёт меню из моков `@repo/shared`. Деплой web на Vercel — `vercel.json` + `.docs/deploy-vercel.md` (API — отдельный хост).

## Окружение

Шаблон — `.env.example`: `DATABASE_URL`/`DIRECT_URL`, `VITE_SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `UPSTASH_REDIS_REST_*`, `BOT_TOKEN`, `WEBAPP_URL`. Postinstall Prisma/esbuild — `onlyBuiltDependencies` в `pnpm-workspace.yaml`.

Нюанс: web читает `VITE_SUPABASE_*`, API broadcast — `NEXT_PUBLIC_SUPABASE_*`; TODO унифицировать в Фазе 4.

## Правила разработки

- Разработка идёт строго по фазам (roadmap ниже); код фазы выдаётся целиком, без заглушек вида `// ... rest of code`.
- Строгая типизация (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
- Деньги — округление через `roundMoney` из shared; `Decimal` в БД ↔ `number` в shared-типах.
- Серверной цене — доверяем, клиентской — нет: заказ всегда пересчитывается на API.

## Roadmap и статус

- [x] **Фаза 1** — монорепо, Prisma-схема, shared-типы/Zod/моки, ESLint+Prettier, скелеты apps. Валидация пройдена: `prisma generate`, `typecheck`, `lint`, `format` — зелёные (03.11.2026)
- [x] **Фаза 2** — переход web на Vite + React 19 + react-router 7 по FSD; API вынесен в `apps/api` (Hono); Redux Toolkit + RTK Query: `menuApi`, `bookingApi` (Realtime в `onCacheEntryAdded`), `orderApi`, слайсы `cart`/`customizer`/`scene3d`; страницы menu/booking/checkout/tma. Валидация пройдена: `typecheck` 5/5, `lint` 0 ошибок, `format` чисто, `vite build` успешен, smoke API (health/menu/tables) и Vite-прокси — OK (03.11.2026)
- [x] **Фаза 3** — страница блюда: полномасштабное фото + «указатели» слоёв (название, граммовка, ккал) с реактивным пересчётом цены/КБЖУ (03.11.2026)
- [x] **Фаза 3.5** — тёмная тема, лендинг (hero + Current Pick), Coffee Builder (`custom_coffee`). R3F/3D UI и `scene-3d`/`hero-3d` удалены; страница блюда — фото + состав. Валидация: typecheck/lint/build OK (03.11.2026; чистка 10.11.2026)
- [ ] **Фаза 4** — Карта зала(сгенерированный приблизительно зал, с расположением окон, дверей, туалет и столы), связка брони с корзиной (DINE_IN сейчас отключён в checkout), создание Booking в БД, унификация Supabase env-переменных
- [ ] **Фаза 5** — Telegram-бот grammY: Платная доставка(бесплатно от 30р) авторизация(Варианты: 1. Имя и телефон с телеграмма. 2. Пользователь вводит имя, телефон, после чего выпадающее меню - app приложение с картинками товара, выбор доставки, и дату/время), доставка, триггер бариста за 15 минут, live-трекинг статуса.

## Переделать (статус → `.docs/memory-sprint-polish.md`)

- [x] 0 — init, memory, больше продукции (16 позиций)
- [x] 1 — hero + scroll-to-top (без «коробки»)
- [x] 2 — меню: фото + «Состав»
- [x] 3 — оверлеи состава (JPG-варианты тирамису — опционально позже)
- [ ] 4 — страница столов / Фаза 4 (следующий спринт)
- [ ] 5 — админ-панель (admin/staff, по очереди)
- [x] 6 — фолбэк на моки, без ошибок в prod
- [x] 7 — чистка + prep Vercel (деплой аккаунта + БД — вручную)
