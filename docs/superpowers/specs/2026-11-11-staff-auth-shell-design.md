# Staff Auth Shell (срез 1 админки) — Design

Дата: 2026-11-11  
Статус: approved (подход 1, пользователь: «делай без меня»)

## Goal

Скрытый вход персонала, email/пароль, JWT-сессия, хедер с вкладками-заглушками по роли. Без CRUD/бизнес-логики вкладок.

## Scope

**In**
- Кнопка-пиксель в правом углу хедера → `/staff/login`
- `POST /api/auth/login`, `GET /api/auth/me`
- `User.passwordHash`, seed ADMIN + BARISTA
- Layout `/staff/*`, stub-страницы вкладок
- Хедер после логина: вкладки по роли + выход

**Out**
- CRUD меню, смены, склад, выручка, уведомления (следующие срезы)
- Supabase Auth / OAuth
- Отдельный `apps/admin`

## Architecture

| Слой | Решение |
|------|---------|
| Web | FSD: `features/staff-auth`, `pages/staff/*`, `widgets/staff-header` (или ветка в AppHeader) |
| API | Hono `/api/auth/*`, bcryptjs, jsonwebtoken |
| DB | `passwordHash String?` на User; роли ADMIN / BARISTA |
| Session | JWT в `localStorage` (`tactile.staff.token`), Bearer на API |

### Tabs (stubs)

**ADMIN:** Заказы, Меню, Смены, Выручка, Уведомления, Сотрудники  
**BARISTA:** Смена, Заказы, Склад, Уведомления

### Auth flow

1. Login → JWT `{ sub, role, email }` TTL 7d  
2. `prepareHeaders` добавляет Bearer если token есть  
3. `RequireStaff` на `/staff/*` кроме login; роль ADMIN|BARISTA  
4. 401 → clear token → `/staff/login`

### Seed accounts

- `admin@tactile.local` / `admin123` → ADMIN  
- `barista@tactile.local` / `barista123` → BARISTA  

## Error handling

- Неверный логин → 401 `{ error: "invalid_credentials" }` без деталей  
- Нет JWT на /me → 401  
- Prod: не светить stack

## Testing

- typecheck web/api/shared/database  
- Ручной: скрытая кнопка → login → вкладки → logout  
- Login неверным паролем → ошибка без падения
