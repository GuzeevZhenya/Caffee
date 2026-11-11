# AGENTS.md — Tactile Craft Coffee & Bakery

> Контекстный файл для AI-агентов (Cursor) и разработчиков. Обязателен к прочтению перед внесением любых изменений в кодовую базу.

## Критические правила для AI-агента (Cursor)

1. **Строгие границы пакетов:** НИКОГДА не импортируй `@repo/database` в `apps/web`. Весь обмен данными фронтенда с бэкендом идет исключительно через RTK Query (`@/shared/api/baseApi`).
2. **Единый расчёт цены и КБЖУ:** НИКОГДА не дублируй логику подсчёта стоимости или калорий. Всегда используй `calculateItemTotals` из `@repo/shared`. На сервере цена всегда пересчитывается заново; клиентским суммам не доверяем.
3. **Соблюдение FSD:** В `apps/web/src` импорты разрешены строго сверху вниз (`app > pages > widgets > features > entities > shared`). Импортируй слайсы только через их публичный `index.ts`.
4. **Безопасность БД и окружения:** НИКОГДА не читай и не перезаписывай реальные `.env` файлы. Для справки по переменным используй только `.env.example`. После правки `schema.prisma` обязательно напоминай или запускай `pnpm db:generate`.
5. **Обязательная проверка перед сдачей:** После написания или изменения кода ВСЕГДА запускай `pnpm typecheck` и `pnpm lint` (или `pnpm ci:check`), чтобы убедиться в отсутствии ошибок типизации и форматирования.

---

## Что это за проект

Веб-приложение кофейни с тремя основными ядрами:

1. **Интерактивное меню по слоям** — каждое блюдо раскладывается на слои (`basePositionY`/`explodeOffsetY` в конфиге). На странице блюда отображается фото и «указатели» слоёв с названием, граммовкой и КБЖУ. Кастомизация слоёв реактивно пересчитывает цену и калории.
2. **Карта бронирования столов** — защита от овербукинга через атомарный лок в Upstash Redis (`lock:table:{id}:{slot}`, TTL 10 минут) + realtime-рассылка статусов через Supabase Realtime (3D-диорама зала — в Фазе 4).
3. **Telegram-бот** — доставка (геолокация, полигон зоны) и предзаказ к столику с триггером «🔥 Готовить сейчас» за 15 минут до брони.

---

## Структура монорепозитория (Turborepo + pnpm)

```text
apps/
  web/        Vite 6 + React 19 + react-router 7 + Tailwind 4 + Redux Toolkit/RTK Query (FSD)
  api/        Hono 4 + @hono/node-server — HTTP API (порт 4000), единственный сервис с доступом к БД
  bot/        grammY (conversations, menu), smoke-скелет до Фазы 5
packages/
  shared/     @repo/shared — типы, Zod-схемы, калькулятор цены/КБЖУ, моки меню и столов
  database/   @repo/database — Prisma-схема, PrismaClient singleton, Redis-локи, seed, мапперы Decimal→number
  typescript-config/  общие tsconfig (base / react / node)
```

- Пакеты `shared` и `database` подключаются как сырые TS-исходники (без отдельного build-шага).
- Подробная карта всех файлов находится в `STRUCTURE.md`.
- Vite dev-сервер проксирует `/api → http://localhost:4000` (см. `apps/web/vite.config.ts`).

---

## Архитектура фронтенда: FSD (`apps/web/src`)

```text
app/          точка входа (main.tsx), router.tsx, store/, providers/, styles/ (дизайн-система)
pages/        home/ menu/ menu-item/ booking/ checkout/ tma/ — композиция виджетов и фичей
widgets/      app-header/ app-footer/ hero-showcase/ menu-item-viewer/ — крупные самодостаточные блоки
features/     cart/ book-table/ menu-customizer/ coffee-builder/ — пользовательские сценарии
entities/     menu-item/ table/ order/ — бизнес-сущности (RTK Query API + UI)
shared/       api/ lib/ ui/ config/ — инфраструктура, не зависящая от бизнеса
```

### Правила FSD и стилизации

- **Иерархия:** `app > pages > widgets > features > entities > shared`. Запрещены импорты снизу вверх и «вбок» на одном уровне (единственное исключение — cross-import между `entities` через их публичный `index.ts`).
- **Сегменты слайса:** `api/` (RTK Query), `model/` (Redux-слайсы, типы), `ui/` (компоненты), `lib/` (утилиты), `index.ts` (публичный API). Внутренние файлы слайса наружу не импортируются.
- **Алиасы:** Используй `@/` для путей внутри `apps/web/src/`.
- **Redux & RTK Query:** Слайсы фичей могут использовать `import type { RootState } from "@/app/store"` (type-only импорт без рантайм-цикла). RTK Query API живут в `entities/*/api/` и регистрируются в `app/store/index.ts` явными импортами (`import "@/entities/menu-item"`).
- **Дизайн-система:** Настроена в `app/styles/index.css` (Tailwind 4 `@theme`). Палитра «вечерний эспрессо-бар» (`ink-900…500`, `gold`, `cream`, `mint`, `rose-warm` в OKLCH), шрифты `Playfair Display` + `Manrope`, готовые классы `.btn`, `.card`, `.chip`, `.nav-pill`, `.eyebrow`, `.field-input`, анимации `--animate-cp-in` и `--animate-float`.
- **Изображения напитков:** Хранятся в `public/drinks/*.jpg`, маппятся через `shared/lib/drink-image.ts` (по slug и id; fallback — `LayerStackSvg`).

---

## API-роуты (`apps/api`)

Базовый префикс для всех эндпоинтов — `/api`. Порт задаётся в `PORT` (по умолчанию `4000`).

| Метод и путь                | Назначение                                                         |
| --------------------------- | ------------------------------------------------------------------ |
| `GET /health`               | Healthcheck сервера                                                |
| `GET /menu`                 | Меню из БД (фолбэк на моки при отсутствии `.env`)                  |
| `GET /tables?date&slot`     | Статусы столов на слот (`FREE` / `HELD` / `OCCUPIED` + Redis-локи) |
| `POST /tables/hold`         | Холд стола на 10 минут + broadcast в Supabase Realtime             |
| `DELETE /tables/hold`       | Снять холд (разрешено только владельцу лока)                       |
| `POST /orders`              | Создать заказ с обязательным серверным пересчётом цены             |
| `GET /orders?id=`           | Получить статус заказа                                             |
| `PATCH /orders/:id/trigger` | Триггер «Готовить сейчас»                                          |

- **Идентификация гостя:** Передаётся через заголовок `x-guest-id` (генерируется в `apps/web/src/shared/lib/guest-id.ts`). Гостевой пользователь в БД — `guest@tactile.local`.
- **Мок-режим:** Без заполненного `.env` маршруты `/menu` и `/tables` отдают моки из `@repo/shared`, а создание заказов и холдов возвращает `503 Service Unavailable`.

---

## Ключевые контракты и модули

- **Калькулятор цены и КБЖУ:** `packages/shared/src/utils/price-calculator.ts` (`calculateItemTotals(item, activeLayerIds)`).
  - Формула: `unitPrice = basePrice + Σ priceModifier активных слоёв`.
  - Удаление базового слоя не уменьшает цену блюда.
  - `baseCalories` блюда — надбавка поверх слоёв (в моках `0`, вся КБЖУ заложена в слоях).
- **Слепок кастомизации:** `CustomConfiguration { activeLayerIds, removedTitles, addedTitles }` сохраняется в JSON-поле `OrderItem.customConfiguration`.
- **3D-конфиг слоя:** Тип `MenuItemLayerConfig` в `packages/shared/src/types/three-menu.types.ts` (`basePositionY`, `explodeOffsetY`, `heightScale`, `radiusScale`, `labelPosition`, материал `colorHex`, `opacity`, `roughness`). Там же описан `MenuResponse`.
- **Fallback-рендер 3D:** Если `MenuItem.modelUrl === null`, слои рендерятся процедурными примитивами (`primitiveType`: `CYLINDER` / `BOX` / `SPHERE` / `TORUS`), `.glb` модели не требуются.
- **Локи столов (Redis):** `packages/database/src/redis.ts` (`lockTable`, `unlockTable`, `getTableLocks`). Ключ `lock:table:{tableId}:{slotStartIso}`, TTL `600` сек. Снятие чужого лока блокируется проверкой `userId`. Длительность слота брони — 90 минут.
- **Realtime-события:** Типы в `packages/shared/src/types/realtime.types.ts` (`TableStatusPayload`, `OrderStatusRealtimePayload`, `TableSlotStatus`, `HoldTableResponse`, `CafeTableConfig`, `TABLE_ZONES`). Подписка на канал `cafe-tables` реализована в `bookingApi.onCacheEntryAdded` (`entities/table`).
- **Типы ответов API:** `packages/shared/src/types/api.types.ts` (`CreateOrderResponse`, `OrderStatusResponse`, `ApiErrorResponse`).
- **Валидация (Zod):** Схемы лежат в `packages/shared/src/schemas/` (валидация бронирования столов, создания заказов, кастомизации слоёв и query-параметров). Используются на бэкенде для валидации входящих запросов Hono и на фронтенде для проверки форм.

---

## Окружение (`.env`) и работа с Git

- **Переменные окружения:** Хранятся локально в корневом `.env` (и/или в `apps/*/.env`). Основные ключи: `DATABASE_URL`, `DIRECT_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT`. При добавлении новой переменной обязательно обновляй `.env.example`.
- **Коммиты:** Используй формат Conventional Commits (`feat(web): ...`, `fix(api): ...`, `chore(shared): ...`, `refactor(database): ...`).

---

## Команды разработки (из корня репозитория)

| Команда                      | Назначение                                               |
| ---------------------------- | -------------------------------------------------------- |
| `pnpm dev`                   | Запуск dev-серверов web (5173) и api (4000)              |
| `pnpm build`                 | Полная сборка монорепозитория                            |
| `pnpm lint` / `lint:fix`     | Проверка / автоисправление ESLint                        |
| `pnpm format` / `format:fix` | Проверка / форматирование Prettier                       |
| `pnpm typecheck`             | Проверка типов (`tsc --noEmit`) по всем пакетам          |
| `pnpm ci:check`              | Полный пайплайн проверки: `lint` + `typecheck` + `build` |
| `pnpm db:generate`           | Генерация Prisma Client                                  |
| `pnpm db:push` / `db:seed`   | Применение схемы БД / наполнение сидами                  |

> Дополнительные правила для Cursor находятся в `.cursor/rules/`. При работе с конкретными слоями или пакетами опирайся на них.
