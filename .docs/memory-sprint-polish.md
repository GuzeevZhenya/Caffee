# Memory — спринт polish (после аудита фаз 1–4)

Дата: 2026-11-11  
Источник: `AGENTS.md` → «Переделать».

## Аудит фаз

| Фаза | Статус | Заметки |
|------|--------|---------|
| 1–3.5 | ✅ | Монорепо → Vite/FSD → страница блюда + Coffee Builder |
| 4 | ✅ | Карта зала / DINE_IN / Booking / Supabase env — см. `memory-sprint-phase-4.md` |
| 5 | ❌ спринт отдельно | Telegram-бот (= не в этом бэклоге polish) |

## Бэклог «Переделать» — статус на 11.11.2026

| # | Пункт | Статус | Что сделано / осталось |
|---|--------|--------|-------------------------|
| 0 | Init + memory + больше продукции | ✅ | 16 позиций в моках; memory актуальный |
| 1 | Hero + scroll-to-top | ✅ | Full-bleed hero (фото/атмосфера), без «коробки»; `ScrollToTop` в layout |
| 2 | Меню: фото + «Состав» | ✅ | `DrinkPhoto` edge-to-edge на карточках; кнопка «Состав»; popular grid |
| 3 | Динамика фото при смене состава | ✅* | SVG-оверлеи (малина/фисташка/ягоды). \*JPG-варианты тирамису — позже |
| 4 | Страница столов | ✅ | HallMap + Booking HELD + DINE_IN |
| 5 | Админ-панель | срез 1 ✅ | Вход и заглушки вкладок — `memory-sprint-admin-shell.md`. CRUD ещё нет |
| 6 | Фолбэк на моки, без ошибок в prod | ✅ | `data-fallback` + `safe-error-message` |
| 7 | Чистка + Vercel + БД | ✅ prep | Удалены mockup/3D; `vercel.json` + `.docs/deploy-vercel.md`. Деплой аккаунта + реальная БД — вручную |

## UI-правки 11.11 (этот коммит)

- Редизайн под refs Brew Haven / BODRIN: тёмная палитра, без Order Now
- Hero/CTA: один визуальный слой, без двойной картинки
- Карточки меню: фото на всю площадь, без серого inset
- Страница блюда:
  - фото **целиком** (`fit="contain"`, без `object-cover` обрезки)
  - единый фон секции (`menu-item-detail-wash`, tone `dark` / `caramel`)
  - лёгкая атмосфера из `--detail-photo` (blur + вуаль)
  - края студийных JPG feather в `#0f0a08` (скрипт `tmp-vignette/feather-drinks.mjs`, бэкап в `public/drinks/_orig/` — не в git)
- RTK Query: `overrideExisting: true` (фикс вечного loading после HMR)

## Осталось

1. Три правки интерфейса из `.docs/backlog/README.md` (hero, «деморежим», форма брони на 2 часа).
2. CRUD вкладок персонала. Каркас входа уже есть.
3. Фаза 5 — Telegram-бот.
4. По желанию: JPG-варианты тирамису при топпингах.
5. Залив на Vercel и боевые БД/Redis.

## Следующий заход

Сначала пункты из backlog «Сейчас», затем CRUD админки и фаза 5.
