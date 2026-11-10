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

**Дизайн-система** — в `app/styles/index.css` (Tailwind 4 `@theme`): палитра «вечерний эспрессо-бар» (ink-900…500, gold, cream, mint, rose-warm в OKLCH), шрифты Playfair Display + Manrope, зернистая текстура, компонентные классы `.btn`/`.card`/`.chip`/`.nav-pill`/`.eyebrow`/`.field-input`, анимации `--animate-cp-in` и `--animate-float`. Центральное фото лендинга — `shared/ui/TiltPhoto.tsx.

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

⚠️ Файл `3D-POSITIONS.md` в корне содержит **альтернативный сид** (4 блюда с выверенными 3D-координатами и чередованием выносок влево/вправо, 6 столов с `minDeposit` и `cameraFocus`). Пока не применён — текущий `seed.ts` использует моки из `@repo/shared`. Решение об интеграции — за владельцем.

## Окружение

Шаблон — `.env.example`: `DATABASE_URL`/`DIRECT_URL` (Supabase pooler + direct), `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `BOT_TOKEN`, `WEBAPP_URL`. Postinstall-скрипты Prisma/esbuild разрешены через `onlyBuiltDependencies` в `pnpm-workspace.yaml`.

Нюанс с Supabase-ключами: web читает `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (через `import.meta.env`), а `apps/api/src/lib/broadcast.ts` пока читает `NEXT_PUBLIC_SUPABASE_*` — обе переменные нужно заполнить; TODO унифицировать в Фазе 4.

## Правила разработки

- Разработка идёт строго по фазам (roadmap ниже); код фазы выдаётся целиком, без заглушек вида `// ... rest of code`.
- Строгая типизация (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
- Деньги — округление через `roundMoney` из shared; `Decimal` в БД ↔ `number` в shared-типах.
- Серверной цене — доверяем, клиентской — нет: заказ всегда пересчитывается на API.

## Roadmap и статус

- [x] **Фаза 1** — монорепо, Prisma-схема, shared-типы/Zod/моки, ESLint+Prettier, скелеты apps. Валидация пройдена: `prisma generate`, `typecheck`, `lint`, `format` — зелёные (03.11.2026)
- [x] **Фаза 2** — переход web на Vite + React 19 + react-router 7 по FSD; API вынесен в `apps/api` (Hono); Redux Toolkit + RTK Query: `menuApi`, `bookingApi` (Realtime в `onCacheEntryAdded`), `orderApi`, слайсы `cart`/`customizer`/`scene3d`; страницы menu/booking/checkout/tma. Валидация пройдена: `typecheck` 5/5, `lint` 0 ошибок, `format` чисто, `vite build` успешен, smoke API (health/menu/tables) и Vite-прокси — OK (03.11.2026)
- [x] **Фаза 3** — страница блюда: полномасштабное фото + «указатели» слоёв (название, граммовка, ккал) с реактивным пересчётом цены/КБЖУ (03.11.2026)
- [x] **Фаза 3.5** — перенос дизайна из mockup/: тёмная тема, лендинг (hero-витрина с каруселью и Current Pick), «Собери свой кофе» (конструктор из 12 ингредиентов, позиция `custom_coffee` в корзине). 3D-конструктор из Фазы 3 выведен из UI (код `entities/menu-item/ui/3d/` сохранён на диске, но нигде не импортируется; слайсы `scene-3d`/`hero-3d` удалены). Валидация пройдена: `typecheck` 5/5, `lint` 0 ошибок, `vite build` OK, smoke в браузере: лендинг/меню/блюдо/конструктор (03.11.2026)
- [ ] **Фаза 4** — Карта зала(сгенерированный приблизительно зал, с расположением окон, дверей, туалет и столы), связка брони с корзиной (DINE_IN сейчас отключён в checkout), создание Booking в БД, унификация Supabase env-переменных
- [ ] **Фаза 5** — Telegram-бот grammY: Платная доставка(бесплатно от 30р) авторизация(Варианты: 1. Имя и телефон с телеграмма. 2. Пользователь вводит имя, телефон, после чего выпадающее меню - app приложение с картинками товара, выбор доставки, и дату/время), доставка, триггер бариста за 15 минут, live-трекинг статуса.

## Переделать(По возможности для реализации использовать субагенты)

0. Проверка проекта, init, просмотр .md - файлов, создание memory после спринта. Проверить с фазы 1 до 4. 5 - Отдельный спринт. Добавить больше вариантов продукции.
1. Главная страница, главная картинка(на фоне чувствуется слишком квадратной и не дополняет фон.Нужно передалть и перед релизом скинуть на проверку). При переходе на новую страницу товар и тд, всегда перекидывать пользователя с самый верх страницы - По возможности для реализации использовать субагенты.
2. Страница меню - добавить фотки каждому блюду и измени название (Конструктор на состав или содержимое) - По возможности для реализации использовать субагенты
3. На подробной странице каждого блюда, есть конструктор, нужно сгенерировать или найти и вставить картнки, если будет измененин состав:
   Пример - Тирамису Малина, если добавить свежую малину, картинка должна изменится, чтобы было видно что там есть малина,если еще хотят Фисташковая крошка то тоже самое. - По возможности для реализации использовать субагенты
4. Доделать страницу столы. (новый спринт, реализовывать как новую задачу после выполнения других)
5. Реализовать админ панель(должна быть невидимая мини-кнопка в самом правом углу хедера). После входа должен обновиться хедер с новыми вкладками(заказы, уведомления и тд все что будет нужно для реализации ниже) ----- выполнять поочередно, не все сразу
   Добавить 2 роли, админ и сотрудник:
   Админ видит все - может редактировать меню, добавлять, архивировать продукцию. Добавлять аккаунт для сотрудника, кол-во заказов, дневную выручку, замечания, предложения, страницу с календарем где указаны смены сотрудников(так же может назначать сотрудника на смену и удалять - 1-2 сотрудника на смену с 10 - 23 ) и тд(придуй еще варианты, что есть во всех кафе)
   Сотрудник - принять смену(должен зайти в аккаунт и принять), у каждого сотрудника свои смены, в личном кабинете в случае изменения от админа должно приходить уведомление. Сотрудник указывает какое кофе было продано в его смену и цену. Так же видеть и редактировать кол-во блюд(пироженные и тд) и делать заказы на доставку(если товара осталось мало). (новый спринт, реализовывать как новую задачу после выполнения других)
6. Сделать обработку ошибок, в случае если данные не будут подгружены, использовать моковые. Нужно чтобы было хоть что-то, главное не выводить название ошибки в продакшене.
7. Удаление лишнего/мусорного кода, подготовка проекта для продакшена, залив на versel и помощь в заливе в базы.
