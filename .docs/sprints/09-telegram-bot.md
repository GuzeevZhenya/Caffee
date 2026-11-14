# Спринт 09 — Telegram-бот и Mini App

- Статус: закрыт
- Дата: 2026-11-14
- Ветка: `feature/staff-supabase`

Фаза 5, тонкий путь: бот, витрина в Telegram, залив web на Vercel.

## Сделано

- Бот grammY: меню и корзина в чате; телефон только на оформлении (кнопка или ввод); код подтверждения в чате, затем самовывоз.
- `/zone`, `/status`, кнопки «Готовить сейчас» / «Я опаздываю», поллер напоминаний за 15 минут.
- API: `POST /api/bot/profile`, `GET /api/bot/due-reminders`, `POST /api/bot/reminders/ack`, заказ по `?number=`, демо-заказ **#1045** `COOKING_HOLD`.
- Mini App `/tma`: нижние вкладки Меню / Корзина / Столы / Заказ, те же блюда что на сайте.
- Web на Vercel: [https://caffee-lilac.vercel.app](https://caffee-lilac.vercel.app), Mini App — `/tma`. Для кнопки «Приложение» в Telegram нужен `WEBAPP_URL` с этим HTTPS.
- Страница блюда: крупное фото в латунной рамке; шапка на телефоне и планшете — корзина и меню-гамбургер.

Секреты и `.env` в отчёт не входят.

## Файлы

- `apps/bot` — handlers, shop, cafe-api, poller, webapp
- `apps/api/src/routes/bot.ts`, `lib/bot-auth.ts`
- `apps/web/src/pages/tma`, `widgets/tma-shell`
- `packages/shared` — `bot.schema`, `order-ref`, `FREE_DELIVERY_FROM`
- `vercel.json`, `.env.example` (`WEBAPP_URL`)

## Дальше

- Спринт 10 — боевой API (Railway/Fly) и заказы Mini App не с моков; доставка с адресом; live-статус в чате.
