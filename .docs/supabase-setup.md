# Подключение проекта к Supabase

Файл для людей и агентов. Секреты сюда не писать. Живые значения — только в корневом `.env` (рядом с `package.json`), не в `apps/web/.env`.

Проект в Dashboard: **Caffee**, ref `rqgilfledvpgstmirwnv`.

https://supabase.com/dashboard/project/rqgilfledvpgstmirwnv

## Что куда класть

| Переменная в `.env` | Где взять | Куда идёт |
| --- | --- | --- |
| `DATABASE_URL` | Connect → **Direct** → **Session pooler** → Type **URI** | Prisma runtime. Порт **5432**, хост `*.pooler.supabase.com` |
| `DIRECT_URL` | Та же URI session pooler (или та же строка, что `DATABASE_URL`) | Запасной runtime. С этой сети порт **6543** закрыт, прямой `db.*.supabase.co` — только IPv6 |
| `SUPABASE_URL` | Project Settings → **API Keys** / Data API → Project URL | API, Realtime |
| `SUPABASE_ANON_KEY` | Там же → **anon** / **publishable** `eyJ...` | API. Не service_role |
| `VITE_SUPABASE_URL` | То же, что `SUPABASE_URL` | Браузер, Vite |
| `VITE_SUPABASE_ANON_KEY` | То же, что `SUPABASE_ANON_KEY` | Браузер. Только anon |

Не копировать в Vite: **service_role**. Не брать ключ из Authentication → Providers.

## Кнопки в Dashboard

1. Справа сверху **Connect**.
2. Вкладка **Direct** (Connection string), не Framework и не MCP.
3. **Session pooler** (не Direct connection — IPv6, не Transaction 6543).
4. Type = **URI**.
5. Кнопка Copy у строки. Пользователь в URI: `postgres.<project-ref>`, не голый `postgres`.
6. Пароль базы — **Database Settings** → Reset database password. Это не anon-ключ.
7. Project Settings → **API Keys**: Project URL + `anon`.

## Пароль в URI

Между `:` и `@`. Если в пароле есть спецсимволы:

| Символ | В URI |
| --- | --- |
| `%` | `%25` |
| `@` | `%40` |
| `/` | `%2F` |
| `#` | `%23` |

Лучше пароль из букв и цифр — тогда экранировать нечего. В Connect есть подсказка percent-encode.

После правки `.env` перезапустить API: процесс читает файл один раз при старте.

## Проверка

```powershell
pnpm --filter @repo/database db:diag
pnpm db:push
pnpm db:seed
pnpm db:status
```

Ожидание:

- `prisma-auth=ok`
- `GET http://localhost:4000/api/health` → `"database": "up"`
- `GET http://localhost:4000/api/menu` → `"source": "database"`

`P1000` — неверный пароль Postgres. `P1001` / timeout — не тот хост или порт.

## Redis и бот

Холд столов: `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Без них карта зала на моках, лок на 10 минут не живёт.

`BOT_TOKEN` — токен у [@BotFather](https://t.me/BotFather). `404 Not Found` у grammY = токен неверный.
