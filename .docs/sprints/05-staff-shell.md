# Спринт 05 — вход персонала

- Статус: закрыт
- Дата: 2026-11-11
- Ветка: `feature/phase-4-hall-booking`
- Спека: `docs/superpowers/specs/2026-11-11-staff-auth-shell-design.md`

## Сделано

- Скрытый вход в хедере → `/staff/login`.
- `User.passwordHash`, `POST /auth/login`, `GET /auth/me` (JWT 7 дней).
- `RequireStaff` на `/staff/*`, кроме логина.
- Вкладки-заглушки по роли ADMIN / BARISTA.

## Аккаунты (после `pnpm db:push && pnpm db:seed`)

| Email | Пароль | Роль |
| --- | --- | --- |
| admin@tactile.local | admin123 | ADMIN |
| barista@tactile.local | barista123 | BARISTA |

Без базы те же учётки — `data/local-store.json`.

## Дальше

- Спринт 06 — CRUD вкладок `/api/staff/*`.
