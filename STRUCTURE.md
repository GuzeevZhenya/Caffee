# STRUCTURE.md — карта файлов проекта

> Что за что отвечает каждый файл и папка. Обновляется автоматически командой `/заключение`, когда в сессии добавлялись новые папки/файлы. Файл отражает состояние на 03.11.2026.

## Корень

| Путь                                        | Назначение                                                                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                              | Корневой манифест: скрипты (`dev`, `build`, `lint`, `format`, `typecheck`, `ci:check`, `db:*`), devDependencies на весь монорепо                                                                     |
| `pnpm-workspace.yaml`                       | Состав workspace (`apps/*`, `packages/*`) + `onlyBuiltDependencies` (Prisma, esbuild)                                                                                                                |
| `pnpm-lock.yaml`                            | Локфайл зависимостей pnpm                                                                                                                                                                            |
| `turbo.json`                                | Конфиг Turborepo: пайплайны задач (`build`, `dev`, `typecheck`, `lint`), зависимости между ними                                                                                                      |
| `.turbo/`                                   | **Локальный кэш Turborepo** — хэши задач и их результаты, чтобы повторные `build`/`typecheck`/`lint` выполнялись мгновенно. Рантайм-роли нет, удалять безопасно (пересоздастся), в git не коммитится |
| `tsconfig.json`                             | Базовый tsconfig корня, наследует `packages/typescript-config/base.json`                                                                                                                             |
| `eslint.config.mjs`                         | Flat-конфиг ESLint: react-hooks/react-refresh для web, node-globals для api/bot/packages, ignores для `.next`/`dist`/`.turbo`                                                                        |
| `.prettierrc.json` / `.prettierignore`      | Правила Prettier и исключения (lock-файл, dist и т.п.)                                                                                                                                               |
| `.env.example`                              | Шаблон переменных окружения: `DATABASE_URL`/`DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_*`, `VITE_SUPABASE_*`, `UPSTASH_REDIS_REST_*`, `BOT_TOKEN`, `WEBAPP_URL`                                             |
| `.gitignore`                                | Исключения git: `node_modules`, `.env`, `dist`, `.turbo`, `.next`                                                                                                                                    |
| `AGENTS.md`                                 | Контекстный файл для агентов: архитектура, контракты, команды, roadmap                                                                                                                               |
| `STRUCTURE.md`                              | Этот файл — карта файлов проекта                                                                                                                                                                     |
| `PROJECT_SPEC.md`                           | Исходная спецификация проекта (роль, фазы, требования)                                                                                                                                               |
| `3D-POSITIONS.md`                           | ⚠️ Альтернативный сид: 4 блюда с выверенными 3D-координатами, 6 столов. Не интегрирован, решение за владельцем                                                                                       |
| `.docs/history/`                            | Отчёты сессий `YYYY-MM-DD_coffee-summary.md`, генерируются командой `/заключение`                                                                                                                    |
| `.kimi-code/skills/format-command.md`       | Команда `/формат` — полный цикл проверки кода (lint + format + typecheck + build)                                                                                                                    |
| `.kimi-code/skills/zaklyuchenie-command.md` | Команда `/заключение` — отчёт сессии + актуализация этого файла                                                                                                                                      |

## apps/ — приложения

| Папка      | Назначение                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web` | Клиентское SPA: Vite 6 + React 19 + react-router 7 + Tailwind 4 + Redux Toolkit/RTK Query, FSD-архитектура, порт 5173. **Не импортирует `@repo/database`** — только HTTP |
| `apps/api` | HTTP API: Hono 4 + @hono/node-server, порт 4000. **Единственное приложение с Prisma/Redis**                                                                              |
| `apps/bot` | Telegram-бот на grammY (smoke-скелет до Фазы 5)                                                                                                                          |

### apps/api — HTTP API

| Путь                             | Назначение                                                                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`                   | Точка входа: Hono app, `basePath("/api")`, cors, logger, `/health`, подключение роутов, порт из `PORT` (по умолчанию 4000)                                                                                     |
| `src/routes/menu.ts`             | `GET /menu` — меню из БД через мапперы; фолбэк на MOCK-данные при недоступной БД                                                                                                                               |
| `src/routes/tables.ts`           | `GET /tables?date&slot` — статусы столов (FREE/HELD/OCCUPIED + Redis-локи); `POST /tables/hold` — холд на 10 минут + Supabase-broadcast; `DELETE /tables/hold` — снять свой холд                               |
| `src/routes/orders.ts`           | `POST /orders` — создание заказа с серверным пересчётом цены (`calculateItemTotals`), гостевой user `guest@tactile.local`; `GET /orders?id=` — статус; `PATCH /orders/:id/trigger` — триггер «Готовить сейчас» |
| `src/lib/broadcast.ts`           | Рассылка событий в Supabase Realtime (канал `cafe-tables`); читает `NEXT_PUBLIC_SUPABASE_*` (TODO: унифицировать в Фазе 4)                                                                                     |
| `package.json` / `tsconfig.json` | Манифест и tsconfig приложения (node-профиль)                                                                                                                                                                  |

### apps/bot — Telegram-бот

| Путь                             | Назначение                                      |
| -------------------------------- | ----------------------------------------------- |
| `src/index.ts`                   | Скелет бота на grammY; логика появится в Фазе 5 |
| `package.json` / `tsconfig.json` | Манифест и tsconfig (node-профиль)              |

### apps/web — клиент (FSD)

Иерархия слоёв `app > pages > widgets > features > entities > shared`, импорты только вниз. Алиас `@/` → `apps/web/src/`.

| Путь                             | Назначение                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `index.html`                     | HTML-оболочка SPA (точка монтирования Vite)                                                 |
| `vite.config.ts`                 | Vite: плагины react + `@tailwindcss/vite`, алиас `@`, прокси `/api → http://localhost:4000` |
| `package.json` / `tsconfig.json` | Манифест и tsconfig (react-профиль, paths для алиаса)                                       |

**Слой `app/`**

| Путь                              | Назначение                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/main.tsx`                    | Точка входа React: монтирование `<StoreProvider>` + `<RouterProvider>`                                                                      |
| `app/router.tsx`                  | Маршруты react-router 7: `AppLayout` с `<Outlet>`, страницы menu, `/menu/:itemId`, booking, checkout, tma                                   |
| `app/providers/StoreProvider.tsx` | Провайдер Redux-стора                                                                                                                       |
| `app/store/index.ts`              | Сборка стора: `baseApi.reducerPath`, редьюсеры слайсов cart/customizer/scene3d; импорты `@/entities/*` для регистрации RTK Query эндпоинтов |
| `app/styles/index.css`            | Глобальные стили, директива Tailwind 4                                                                                                      |

**Слой `pages/`**

| Путь                                  | Назначение                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `pages/menu/ui/MenuPage.tsx`          | Каталог меню: сетка карточек, «в корзину» + вход в 3D-конструктор                  |
| `pages/menu-item/ui/MenuItemPage.tsx` | Страница 3D-конструктора `/menu/:itemId`; выбирает чашку/тарелку по slug категории |
| `pages/booking/ui/BookingPage.tsx`    | Бронирование: выбор даты/слота, статусы столов, кнопка холда                       |
| `pages/checkout/ui/CheckoutPage.tsx`  | Оформление заказа (DINE_IN отключён до Фазы 4)                                     |
| `pages/tma/ui/TmaPage.tsx`            | Страница для Telegram Mini App                                                     |
| `pages/*/index.ts`                    | Публичный API слайса страницы                                                      |

**Слой `widgets/`**

| Путь                                             | Назначение                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `widgets/app-header/ui/AppHeader.tsx`            | Шапка: навигация, счётчик корзины                                                                 |
| `widgets/menu-item-viewer/ui/MenuItemViewer.tsx` | 3D-конструктор блюда: композиция `ExplodedItem` + `CustomizerPanel` + «в корзину» с конфигурацией |

**Слой `features/`**

| Путь                                                | Назначение                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `features/cart/model/cartSlice.ts`                  | Redux-слайс корзины: позиции, `activeLayerIds`, итоги через `calculateItemTotals` |
| `features/cart/ui/AddToCartButton.tsx`              | Кнопка добавления блюда в корзину                                                 |
| `features/book-table/ui/HoldTableButton.tsx`        | Кнопка холда стола (слот 90 минут), `attachBooking`                               |
| `features/menu-customizer/model/customizerSlice.ts` | Слайс кастомизации слоёв блюда (вкл/выкл слои)                                    |
| `features/menu-customizer/ui/CustomizerPanel.tsx`   | Панель состава: переключатели слоёв, живой пересчёт цены/КБЖУ                     |
| `features/scene-3d/model/scene3dSlice.ts`           | Слайс состояния 3D-сцены (выбранное блюдо, explode-степень, день/вечер)           |
| `features/scene-3d/ui/SceneControls.tsx`            | Кнопки «Разобрать/собрать на слои» и переключение освещения день/вечер            |
| `features/*/index.ts`                               | Публичный API фичи                                                                |

**Слой `entities/`**

| Путь                                               | Назначение                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `entities/menu-item/api/menuApi.ts`                | RTK Query: `GET /menu`, тег `Menu`                                                                                        |
| `entities/menu-item/ui/MenuItemCard.tsx`           | Карточка блюда со слотом `action`                                                                                         |
| `entities/menu-item/ui/3d/ExplodedItem.tsx`        | Ядро 3D: Canvas, освещение день/вечер, анимация разлёта слоёв (maath damp), чистый пропс-driven компонент                 |
| `entities/menu-item/ui/3d/LayerMesh.tsx`           | Процедурный меш слоя: CYLINDER/BOX/SPHERE/TORUS (CUSTOM_MESH — заглушка до .glb), материал из конфига                     |
| `entities/menu-item/ui/3d/LayerHtmlPin.tsx`        | Выноска `<Html>` слоя: название, граммовка, КБЖУ, наценка; сторона — по знаку X в `labelPosition`                         |
| `entities/menu-item/ui/3d/ProceduralCoffeeCup.tsx` | Чашка с блюдцем (напитки) и `ProceduralPlate` (десерты/выпечка) — декоративные основы                                     |
| `entities/table/api/bookingApi.ts`                 | RTK Query: статусы столов, hold/delete hold; `onCacheEntryAdded` → подписка на Supabase-канал `cafe-tables`, тег `Tables` |
| `entities/table/ui/TableStatusBadge.tsx`           | Бейдж статуса стола (FREE/HELD/OCCUPIED)                                                                                  |
| `entities/order/api/orderApi.ts`                   | RTK Query: создание заказа, статус, trigger; тег `Orders`                                                                 |
| `entities/*/index.ts`                              | Публичный API сущности                                                                                                    |

**Слой `shared/`**

| Путь                             | Назначение                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `shared/api/baseApi.ts`          | Базовый RTK Query API: `baseUrl /api`, заголовок `x-guest-id`, `tagTypes` Menu/Tables/Orders              |
| `shared/lib/guest-id.ts`         | Генерация/хранение guest-id в localStorage                                                                |
| `shared/lib/supabase-browser.ts` | Клиент Supabase для браузера; читает `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` через `import.meta.env` |

## packages/ — общие пакеты

### packages/shared — @repo/shared

| Путь                             | Назначение                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/index.ts`                   | Публичный вход пакета (реэкспорт всего)                                                                                                          |
| `src/types/three-menu.types.ts`  | Типы 3D-меню: `MenuItem`, `MenuItemLayerConfig` (`basePositionY`, `explodeOffsetY`, материал, `labelPosition`), `MenuResponse`                   |
| `src/types/realtime.types.ts`    | Realtime-контракты: `TableStatusPayload`, `OrderStatusRealtimePayload`, `TableSlotStatus`, `HoldTableResponse`, `CafeTableConfig`, `TABLE_ZONES` |
| `src/types/api.types.ts`         | Контракты ответов API: `CreateOrderResponse`, `OrderStatusResponse`, `ApiErrorResponse`                                                          |
| `src/schemas/address.schema.ts`  | Zod: адрес + полигон доставки (`isPointInDeliveryZone`)                                                                                          |
| `src/schemas/booking.schema.ts`  | Zod: бронь/холд стола                                                                                                                            |
| `src/schemas/order.schema.ts`    | Zod: создание заказа                                                                                                                             |
| `src/utils/price-calculator.ts`  | **Единый источник правды цены/КБЖУ**: `calculateItemTotals`, `roundMoney`                                                                        |
| `src/mocks/menu.mock.ts`         | MOCK-меню (блюда со слоями), фолбэк для API и seed                                                                                               |
| `src/mocks/tables.mock.ts`       | MOCK_TABLES — 10 столов, фолбэк для `/tables`                                                                                                    |
| `package.json` / `tsconfig.json` | Манифест и tsconfig пакета                                                                                                                       |

### packages/database — @repo/database

| Путь                             | Назначение                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`           | Схема БД: 8 моделей, 6 enum'ов; `User.telegramId` — BigInt                                     |
| `src/client.ts`                  | PrismaClient singleton + патч `BigInt.prototype.toJSON`                                        |
| `src/redis.ts`                   | Локи столов: `lockTable/unlockTable/getTableLocks`, ключ `lock:table:{id}:{slot}`, TTL 600 сек |
| `src/mappers.ts`                 | Мапперы Prisma → shared-типы: Decimal→Number, JSON→кортежи с runtime-гардами                   |
| `seed.ts`                        | Идемпотентный сид из MOCK-меню `@repo/shared`                                                  |
| `src/index.ts`                   | Публичный вход пакета                                                                          |
| `package.json` / `tsconfig.json` | Манифест и tsconfig пакета                                                                     |

### packages/typescript-config

| Путь           | Назначение                                                         |
| -------------- | ------------------------------------------------------------------ |
| `base.json`    | База: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` |
| `react.json`   | Профиль для web (JSX, DOM, bundler-resolution)                     |
| `node.json`    | Профиль для api/bot/packages                                       |
| `nextjs.json`  | ⚠️ Наследие Next.js — не используется, кандидат на удаление        |
| `package.json` | Манифест пакета конфигов                                           |

## Служебные директории (не коммитятся)

| Путь              | Назначение                                                                   |
| ----------------- | ---------------------------------------------------------------------------- |
| `node_modules/`   | Установленные зависимости (pnpm)                                             |
| `.turbo/`         | Кэш Turborepo (см. выше) — есть и в корне, и внутри каждого app/package      |
| `dist/`, `.next/` | Артефакты сборки; `.next` в `apps/web` — мусор от Next.js, подлежит удалению |
