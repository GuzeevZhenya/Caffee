# PROJECT_SPEC — Tactile Craft Coffee & Bakery

Снимок продукта на 11.11.2026. Правила агента — `AGENTS.md`. Карта файлов — `STRUCTURE.md`.

Ранний набросок (Next.js App Router, React Three Fiber, `.glb`, API routes внутри web) снят. Актуальный UI — фото и 2D-карта зала.

## Продукт

Одна кофейня, не мультиарендная система.

1. Меню по слоям: фото, состав, граммы, КБЖУ, пересчёт цены при кастомизации.
2. Бронь стола с карты зала: холд на 10 минут, защита от двойной брони, статус в реальном времени.
3. Заказ в зале по уже взятому столу или доставка (полигон зоны — в боте, фаза 5).
4. Скрытый вход персонала: email и пароль, вкладки по роли. CRUD вкладок ещё нет.

## Стек

| Часть | Сейчас |
| --- | --- |
| `apps/web` | Vite 6, React 19, react-router 7, Tailwind 4, Redux Toolkit / RTK Query, FSD. Порт 5173 |
| `apps/api` | Hono 4, порт 4000, префикс `/api`. Единственное место с Prisma и Redis |
| `apps/bot` | grammY, smoke до фазы 5 |
| `packages/shared` | типы, Zod, калькулятор цены и КБЖУ, моки |
| `packages/database` | Prisma, Redis-локи, сид, мапперы |
| `packages/typescript-config` | `base.json`, `react.json`, `node.json` |

Данные: Supabase Postgres, Upstash Redis, Supabase Realtime. Шаблон переменных — `.env.example`.

## Страницы web

`/` главная, `/menu`, `/menu/:itemId`, `/booking`, `/checkout`, `/tma`, `/staff/login` и кабинет `/staff/*`.

## Фазы

- [x] 1 — монорепо, Prisma, shared, скелеты приложений
- [x] 2 — Vite + FSD, API на Hono, RTK Query
- [x] 3 и 3.5 — страница блюда, тёмная тема, Coffee Builder; 3D-сцены удалены
- [x] 4 — карта зала, запись брони при холде, заказ «в кафе»
- [x] Админка, срез 1 — вход и пустые вкладки
- [x] Админка, срез 2 — заказы, меню, смены, склад, выручка, уведомления, сотрудники
- [ ] 5 — Telegram-бот

Открытые правки после фаз 1–4 — `.docs/backlog/README.md`.
