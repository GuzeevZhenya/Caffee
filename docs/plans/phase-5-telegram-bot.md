# План — Фаза 5 Telegram-бот

## 5.1 Тонкий путь (сейчас)

- Shared: `FREE_DELIVERY_FROM`, `BOOKING_REMINDER_MINUTES`, `parseOrderRef`, Zod профиля
- API: `POST /api/bot/profile`, `GET /api/bot/due-reminders`, `POST /api/bot/reminders/ack`, `GET /api/orders?number=`
- Бот: сессия, контакт, гео, статус, inline-триггер, поллер 15 минут
- Демо: заказ `1045` в `COOKING_HOLD`; зона считается в процессе бота из shared

## 5.2 Заказ и TMA

- Корзина / доставка из Mini App, адрес в зоне, `DELIVERY` в checkout
- Связка `telegramId` с заказом сайта

## 5.3 Live-статус

- Подписка на канал `orders`, `editMessageText` по `telegramMessageId`
