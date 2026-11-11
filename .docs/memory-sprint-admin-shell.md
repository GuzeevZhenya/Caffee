# Memory — админка срез 1 (auth shell)

Дата: 2026-11-11  
Spec: `docs/superpowers/specs/2026-11-11-staff-auth-shell-design.md`

## Сделано

- Скрытая точка входа в хедере → `/staff/login`
- `User.passwordHash`, seed `admin@tactile.local` / `barista@tactile.local`
- API `POST /auth/login`, `GET /auth/me` (JWT 7d)
- Хедер после входа: вкладки-заглушки (ADMIN / BARISTA) + Выйти
- `RequireStaff` на `/staff/*`

## Аккаунты (после `pnpm db:push && pnpm db:seed`)

| Email | Пароль | Роль |
|-------|--------|------|
| admin@tactile.local | admin123 | ADMIN |
| barista@tactile.local | barista123 | BARISTA |

## Дальше

CRUD меню, смены, выручка, склад, уведомления, сотрудники.
