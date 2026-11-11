# Фаза 4 — Карта зала и бронь

**Goal:** Интерактивная 2D-карта зала, Booking в БД при холде, DINE_IN в checkout, единые Supabase env.

**Scope**
1. Hall layout (стены, окна, дверь, туалет, столы по `position3D`)
2. `POST /tables/hold` создаёт `Booking(HELD)` + `bookingId` в ответе
3. Корзина хранит `bookingId`; checkout включает DINE_IN
4. API/web читают одни Supabase-переменные (`SUPABASE_*` с фолбэком на старые)

**Вне скоупа:** 3D/R3F, админка, Telegram-бот.
