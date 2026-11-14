# AGENTS.md — Tactile Craft Coffee & Bakery

> Контекст для агентов и разработчиков. Читать перед правками. Карта файлов — `STRUCTURE.md`. Очередь спринтов — `.docs/sprints/README.md`. Открытые задачи — `.docs/backlog/README.md`.

## Критические правила

1. **Граница web ↔ api.** Не импортировать `@repo/database` в `apps/web`. Данные только через RTK Query (`@/shared/api/baseApi`). API не импортирует код из web.
2. **Цена и КБЖУ.** Только `calculateItemTotals` из `@repo/shared`. На сервере цена пересчитывается заново; клиентским суммам не доверяем.
3. **FSD.** В `apps/web/src` импорты только вниз: `app > pages > widgets > features > entities > shared`. Слайс снаружи — только через `index.ts`. Кросс-импорт на одном уровне запрещён, кроме `entities` через публичный API.
4. **Секреты.** Не читать и не перезаписывать `.env`. Новые переменные — в `.env.example` пустыми. В браузере только `VITE_*`.
5. **Схема БД.** Правки в `packages/database/prisma/schema.prisma`, затем `pnpm db:generate`. Отдельной генерации Supabase-типов нет: наружу идут мапперы в shared-типы.
6. **Сдача.** Перед финальным ответом — `pnpm ci:check` (`lint` + `typecheck` + `build`). Prettier отдельно: `pnpm format`. Если запрос ломает правила 1–3, сказать об этом до кода.
7. **Коммиты.** Только по явной просьбе. Conventional Commits, описание на русском, без `Co-authored-by`.

## Что это

Веб-приложение одной кофейни. Три ядра:

1. **Меню по слоям** — фото блюда, состав (название, граммы, КБЖУ), кастомизация с пересчётом цены и калорий. 3D/R3F снят в фазе 3.5. Типы слоя в `packages/shared/src/types/three-menu.types.ts` остаются контрактом данных, не сценой.
2. **Карта зала** — 2D SVG (`widgets/hall-map`). Холд: Redis `lock:table:{tableId}:{slotStartIso}`, TTL 10 минут, затем `Booking(HELD)` и `bookingId`. Realtime — Supabase, канал `cafe-tables`.
3. **Telegram-бот** — grammY + Mini App `/tma`. Меню в чате и в приложении; телефон на оформлении; `/zone`, `/status`, триггер за 15 минут. Бриф: `.docs/sprints/09-telegram-bot.md`.

## Монорепозиторий

Turborepo + pnpm. Пакеты `shared` и `database` отдаются исходниками, без своего build.

```text
apps/web    Vite 6 + React 19 + react-router 7 + Tailwind 4 + RTK, FSD, порт 5173
apps/api    Hono 4, порт 4000, basePath /api — единственный доступ к Prisma и Redis
apps/bot    grammY, Mini App `/tma`
packages/   shared, database, typescript-config (base / react / node)
```

Vite проксирует `/api` → `http://localhost:4000`.

### FSD (`apps/web/src`)

- `app/` — вход, роутер, store, стили.
- `pages/` — home, menu, menu-item, booking, checkout, tma, staff.
- `widgets/` — app-header, app-footer, hero-showcase, menu-item-viewer, hall-map, tma-shell.
- `features/` — cart, book-table, menu-customizer, coffee-builder, staff-auth.
- `entities/` — menu-item, table, order.
- `shared/` — api, lib, ui. Папки `config` нет.

Алиас `@/` → `apps/web/src/`. `import type { RootState }` из `@/app/store` допустим только как type-only. RTK Query живёт в `entities/*/api` и подключается в `app/store/index.ts` явным импортом сущности.

Стили: `app/styles/index.css`, Tailwind 4 `@theme`. Палитра ink / gold / cream / mint / rose-warm, шрифты Playfair Display и Manrope. Классы `.btn`, `.card`, `.chip`, `.nav-pill`, `.eyebrow`, `.field-input`. Фото напитков: `public/drinks/*.jpg`, маппинг `shared/lib/drink-image.ts`.

## API (`/api`)

| Метод и путь                | Назначение                                               |
| --------------------------- | -------------------------------------------------------- |
| `GET /health`               | healthcheck                                              |
| `GET /menu`                 | меню из БД; мок, если нет `.env` или сбой БД             |
| `GET /tables?date&slot`     | `FREE` / `HELD` / `BOOKED` и Redis-локи                  |
| `POST /tables/hold`         | лок на 10 минут, `Booking(HELD)`, `bookingId`, broadcast |
| `DELETE /tables/hold`       | снять свой холд                                          |
| `POST /orders`              | заказ; доставка — адрес + зона, от 30 BYN                |
| `GET /orders?id=`           | статус заказа                                            |
| `PATCH /orders/:id/trigger` | «Готовить сейчас»                                        |
| `POST /bot/profile`         | Telegram → гость                                         |
| `GET /bot/due-reminders`    | поллер напоминаний                                       |
| `POST /bot/reminders/ack`   | подтвердить напоминание                                  |
| `POST /auth/login`          | email и пароль персонала → JWT                           |
| `GET /auth/me`              | текущий сотрудник по Bearer                              |

Гость: заголовок `x-guest-id` (`apps/web/src/shared/lib/guest-id.ts`), пользователь в БД — `guest@tactile.local`. Секреты — корневой `.env` (шаблон `.env.example`): его читают API, Vite и `pnpm db:push`. Без `DATABASE_URL` меню и столы читаются из моков, а заказы, правки меню, смены, склад и сотрудники пишутся в `data/local-store.json` (файл в `.gitignore`). Если строка Supabase задана, эти фолбэки выключены: источник — Prisma, сбой базы — `503`.

Персонал: JWT на 7 дней, ключ `tactile.staff.token` в `localStorage`. `RequireStaff` закрывает `/staff/*`, кроме `/staff/login`. Вкладки: заказы и статусы, меню (цена и наличие), смены, выручка, уведомления, сотрудники, склад. Учётки сида — `.docs/sprints/05-staff-shell.md`. Без базы те же учётки лежат в `data/local-store.json`.

| Метод и путь                                    | Назначение                            |
| ----------------------------------------------- | ------------------------------------- |
| `GET /staff/orders`, `PATCH /staff/orders/:id`  | очередь и статус                      |
| `GET /staff/menu`, `PATCH /staff/menu/:id`      | цена, название, наличие               |
| `GET /staff/revenue?date=`                      | суммы за день                         |
| `GET /staff/shifts`, `POST /staff/shifts`       | открыть и закрыть смену               |
| `GET /staff/stock`, `PATCH /staff/stock/:id`    | остатки выпечки                       |
| `GET /staff/notifications`                      | готовые заказы, низкий остаток, смена |
| `GET /staff/employees`, `POST /staff/employees` | список и новая учётка                 |

## Контракты

- Калькулятор: `packages/shared/src/utils/price-calculator.ts`. `unitPrice = basePrice + Σ priceModifier` активных слоёв. Снятие базового слоя цену не уменьшает. `baseCalories` — надбавка поверх слоёв (в моках `0`).
- Слепок заказа: `CustomConfiguration { activeLayerIds, removedTitles, addedTitles }` в `OrderItem.customConfiguration`.
- Локи: `packages/database/src/redis.ts`. Чужой лок снять нельзя (проверка `userId`). Слот брони — 120 минут (`BOOKING_SLOT_MINUTES`): 16:00 занимает стол до 18:00.
- Checkout: корзина хранит `bookingId`. Тип «В кафе» (`DINE_IN`) доступен только вместе с ним.
- Realtime-типы: `packages/shared/src/types/realtime.types.ts`. Подписка — `bookingApi.onCacheEntryAdded` в `entities/table`.
- Zod: `packages/shared/src/schemas/`. Одни схемы на web, API и боте. Статусы — константы shared, не строковые литералы.
- Мапперы: `packages/database/src/mappers.ts` (`Decimal` → `number`). Наружу только shared-типы.
- Supabase: канон `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Web — `VITE_SUPABASE_*`. API читает `SUPABASE_*`, затем `VITE_*`, затем `NEXT_PUBLIC_*`.

## Команды

| Команда                                                  | Что делает                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                                               | web `:5173` и api `:4000`                                   |
| `pnpm build` / `build:web`                               | сборка всего монорепо / только web                          |
| `pnpm lint` / `lint:fix`                                 | ESLint                                                      |
| `pnpm format` / `format:fix`                             | Prettier                                                    |
| `pnpm typecheck`                                         | `tsc --noEmit` через turbo                                  |
| `pnpm ci:check`                                          | lint + typecheck + build                                    |
| `pnpm db:generate` / `db:push` / `db:seed` / `db:status` | Prisma Client / схема в Supabase / сид / проверка счётчиков |

Скиллы агента: `.cursor/skills/` — `/формат`, `/закрыть-спринт` (пишет `.docs/sprints/NN-*.md`). Чек-лист ревью — `REVIEW.md`. Перед «дальше» читай `.docs/sprints/README.md`, не имя спринта.

## Roadmap

- [x] Фазы 1–3.5 — монорепо, Vite и FSD, страница блюда, тёмная тема, Coffee Builder. R3F снят.
- [x] Фаза 4 — 2D-карта зала, `Booking(HELD)`, `DINE_IN`, единые Supabase env. Бриф: `.docs/sprints/04-hall.md`.
- [x] Админка, срез 1 — вход персонала и вкладки-заглушки. Спека: `docs/superpowers/specs/2026-11-11-staff-auth-shell-design.md`.
- [x] Админка, срез 2 — заказы, меню, смены, склад, выручка, уведомления, сотрудники.
- [x] Фаза 5, тонкий путь — бот, Mini App, Vercel web. Бриф: `.docs/sprints/09-telegram-bot.md`.

Открытые правки интерфейса (hero, надпись «деморежим», форма брони) — `.docs/backlog/README.md`.

## STOP

Остановись и спроси, если без ответа нельзя выбрать поведение, нужен `push --force` или `reset --hard`, либо в коммит попадают секреты.

## Исправить

0. Каждый этап ниже сперва показываешь что сделал и после одобрения следующий, пока я не проверю дальше стоп. Это пункты одного спринта, не новые номера. Закрытие — `/закрыть-спринт`.
1. ![alt text](image-1.png) - Главная страница. картинку во всю высоту
2. ![alt text](image-2.png) - Главная страница, сделать фоновой картинкой. не растягивать
3. ![alt text](image-3.png) - menu/item -вернуть вариант как был
4. ![alt text](image-4.png) - Бронирование столов,белый квадрат появляется при выборе стола, проверить
5. Админ панель, меню - нет возможности добавить новый товар, и изменить картинку
6. ![alt text](image-5.png) - Футер -сделать страницу о кофейне, накидай что нибудь туда. Убери состав по слоям и добавь пункты для обработки перс данных
   отдельная страница с заканами РБ, а так же выводом что обрабатываются персональные и локал сторедж, плюс поищи еще какие есть требования при оформлении
   сайта для экслоотации.
7. Подключение к supabase. — спринт **08**, закрыт.
8. Telegram-бот и Mini App. — спринт **09**, закрыт.
