# Спринт 06 — CRUD админки

- Статус: закрыт
- Дата: 2026-11-13
- Ветка: `feature/staff-supabase`

## Сделано

- Очередь заказов и смена статуса.
- Меню: цена, название, наличие (без создания товара и без загрузки фото — это спринт 07).
- Смены, склад выпечки, выручка за день, уведомления, сотрудники.
- API `/api/staff/*`. Без `DATABASE_URL` запись в `data/local-store.json`.

## Файлы

- `apps/api/src/routes/staff.ts`, `lib/staff-board.ts`, `lib/local-store.ts`
- `apps/web/src/features/staff-board`, `pages/staff/ui/Staff*Page.tsx`

## Дальше

- Спринт 07 — список «Исправить» в `AGENTS.md` (UI, юр. страницы, фото товара).
