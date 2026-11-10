# Деплой на Vercel (web) + БД

Дата: 2026-11-10

## Что деплоится на Vercel

Только **apps/web** (Vite SPA). Конфиг: корневой `vercel.json`.

- Сборка: `pnpm --filter @repo/web build` → `apps/web/dist`
- SPA-rewrites для react-router; путь `/api/*` не перехватывается (ждёт внешний API)

Без живого API фронт работает на **клиентских моках** (п.6 бэклога): меню/столы читаются, заказы/холды — с безопасными сообщениями об ошибке.

## Env на Vercel (Project → Settings → Environment Variables)

| Переменная | Нужна для |
| ---------- | --------- |
| `VITE_SUPABASE_URL` | Realtime-подписка на столы (опционально) |
| `VITE_SUPABASE_ANON_KEY` | то же |

`VITE_*` вшиваются на **build** — после смены ключей нужен redeploy.

## API (не на Vercel в этой итерации)

`apps/api` — долгоживущий Node (`@hono/node-server` + Prisma + Redis). Для полного продакшена поднимите на Railway / Fly / Render и проксируйте `/api` на этот хост (или задайте `baseUrl` в `baseApi`).

Нужные секреты API (см. `.env.example`):

- `DATABASE_URL`, `DIRECT_URL` — Supabase Postgres
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (broadcast; TODO унифицировать с `VITE_*`)

## Помощь с БД (Supabase + Prisma)

1. Создайте проект Supabase, скопируйте connection strings в `.env` (корень или `packages/database`).
2. Из корня:
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```
3. Проверьте `GET http://localhost:4000/api/menu` — без фолбэка на моки.

## Чеклист первого залива web

1. Подключить репозиторий к Vercel, Root Directory = `.` (корень монорепо).
2. Framework Preset: Other; команды возьмутся из `vercel.json`.
3. Добавить `VITE_SUPABASE_*` при необходимости.
4. Deploy → открыть URL, проверить `/`, `/menu`, `/menu/:id`, `/booking`, `/checkout`.
