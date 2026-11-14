# Спринт 08 — подключение к Supabase

- Статус: закрыт
- Дата: 2026-11-14
- Ветка: `feature/staff-supabase`

Пункт 7 из «Исправить» в `AGENTS.md`.

## Сделано

- Корневой `.env` читают API, Vite, `pnpm db:push` / `db:seed` / `db:diag`. Секреты в отчёт не входят.
- Порт **6543** с этой сети таймаут. Runtime берёт session pooler **5432** (`prefer-pooler.ts`), файл `.env` не перезаписывается.
- Прямой `db.*.supabase.co` — только IPv6, тоже таймаут. Хост пулера `aws-1-eu-west-1.pooler.supabase.com`.
- Пароль Postgres принят. `prisma db push` и сид прошли: 6 категорий, 16 блюд, 10 столов, 2 учётки персонала.
- `/api/health` → `database: up`. `/api/menu` → `source: database`.
- Инструкция экранов Dashboard: `.docs/supabase-setup.md`.

## Файлы

- `packages/database/src/prefer-pooler.ts`, `load-env.ts`, `diag.ts`, `scripts/run-with-root-env.mjs`
- `.docs/supabase-setup.md`, `.env.example`

## Дальше

- Спринт 09 — Фаза 5, Telegram-бот.
