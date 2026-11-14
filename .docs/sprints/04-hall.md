# Спринт 04 — карта зала

- Статус: закрыт
- Дата: 2026-11-11
- Ветка: `feature/phase-4-hall-booking`
- PRD: `docs/prd/phase-4-hall-booking.md`

## Сделано

- Карта зала `HallMap` (SVG): зоны, столы по `position3D`, клик → холд.
- `POST /api/tables/hold` после Redis-лока создаёт `Booking(HELD)` и `bookingId`.
- Checkout: тип «В кафе» (`DINE_IN`) только с `bookingId`.
- Env Supabase: API читает `SUPABASE_*` → `VITE_*` → `NEXT_PUBLIC_*`.

## Файлы

- `apps/web/src/widgets/hall-map`
- `apps/api/src/routes/tables.ts`, `lib/broadcast.ts`
- `packages/shared` — hall-layout, `HoldTableResponse.bookingId`

## Дальше

- Спринт 05 — вход персонала. Боевая база — не в этом номере.
