# Memory — Фаза 4 / спринт столы

Дата: 2026-11-11  
Ветка: `feature/phase-4-hall-booking`  
PRD: `docs/prd/phase-4-hall-booking.md`

## Сделано

1. **Карта зала** — `HallMap` (SVG): стены, окна, вход, WC, бар, зоны; столы по `position3D`; клик → холд.
2. **Booking в БД** — `POST /api/tables/hold` после Redis-лока создаёт `Booking(HELD)` и возвращает `bookingId`; `DELETE` отменяет свой HELD.
3. **Корзина / checkout** — `CartBooking.bookingId`; тип «В кафе» (DINE_IN) доступен при наличии `bookingId`.
4. **Supabase env** — API: `SUPABASE_*` → `VITE_*` → `NEXT_PUBLIC_*`; `.env.example` обновлён.

## Файлы

- `packages/shared` — `hall-layout.types`, `hall-layout.mock`, `HoldTableResponse.bookingId`
- `apps/web/src/widgets/hall-map`
- `apps/api/src/routes/tables.ts`, `lib/broadcast.ts`
- checkout / cart / HoldTableButton / BookingPage

## Осталось (вне фазы / дальше)

- Фаза 5 — Telegram-бот
- CRUD админки. Срез 1 (вход и заглушки) уже есть: `.docs/memory-sprint-admin-shell.md`
- Деплой Vercel + production БД/Redis
- Опционально: JPG-варианты тирамису; таймер холда `TableHoldTimer`
- Правки интерфейса после аудита — `.docs/backlog/README.md`
