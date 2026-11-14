# Деплой на Vercel (web + API) + БД

Дата: 2026-11-14

## Что деплоится на Vercel

**apps/web** (Vite SPA) и **apps/api** как Node Function `api/[[...route]].ts`. Конфиг: корневой `vercel.json`.

- Сборка: `pnpm db:generate && pnpm --filter @repo/web build` → `apps/web/dist`
- SPA-rewrites для react-router; `/api/*` идёт в Hono (тот же код, что `localhost:4000`)

Без `DATABASE_URL` на Vercel меню с функции может отдать моки, запись заказов в production не идёт в local-store.

## Env на Vercel (Project → Settings → Environment Variables)

| Переменная | Нужна для |
| ---------- | --------- |
| `DATABASE_URL`, `DIRECT_URL` | Prisma / Supabase session pooler `:5432` |
| `JWT_SECRET` | вход персонала |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Realtime с API |
| `VITE_SUPABASE_URL` | Realtime-подписка на столы (вшивается на build) |
| `VITE_SUPABASE_ANON_KEY` | то же |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | локи столов |
| `BOT_TOKEN` / `BOT_API_SECRET` | если бот бьёт в этот же `/api` |

`VITE_*` вшиваются на **build** — после смены ключей нужен redeploy. Секреты в репозиторий не класть.

## API

Тот же Hono, что в `apps/api`. Локально по-прежнему `pnpm dev` → `:4000`. На Vercel — функция с `maxDuration` 30 с.

Нужные секреты (см. `.env.example`):

- `DATABASE_URL`, `DIRECT_URL` — Supabase Postgres
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (предпочтительно) или те же `VITE_SUPABASE_*` / legacy `NEXT_PUBLIC_SUPABASE_*`

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
3. Добавить `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, при необходимости `VITE_SUPABASE_*` и Redis.
4. Deploy → проверить `/api/health`, `/`, `/menu`, `/tma`, `/checkout`, `/staff/login`.
