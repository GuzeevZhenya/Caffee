# План — спринт 10

1. Вынести Hono-приложение из `serve()` → `apps/api/src/app.ts`. Обработчик Vercel: `api/[[...route]].ts`. `binaryTargets` Prisma + `pnpm db:generate` в `vercel.json`.
2. Zod: `deliveryAddress` в `createOrderSchema`. Сервер: зона, порог `FREE_DELIVERY_FROM`, запись `Address` + заказ.
3. Checkout: включить «Доставка», поля адреса, гео, статус с поллингом. TMA — меньше отступ, тот же поток.
4. Документация env на Vercel (без секретов). Юр. страница: доставка работает в зоне.
5. Проверка: typecheck, сценарий checkout локально.
