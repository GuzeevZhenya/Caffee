# REVIEW.md — Чек-лист код-ревью

> Загружать на код-ревью (или вместе с субагентом `arch-reviewer`).

## Чек-лист

- [ ] Title PR — Conventional Commits
- [ ] `pnpm ci:check` зелёный; при правках `packages/*` — `pnpm test`
- [ ] Нет секретов в diff (`.env`, ключи, токены)
- [ ] FSD: импорты только вниз, public API через `index.ts`
- [ ] Бизнес-логика не утекла в `apps/*` — только `packages/shared`
- [ ] Внешние данные валидируются Zod из `shared`
- [ ] Статусы — константы `shared`, не литералы
- [ ] Запросы к БД с `workspace_id` / RLS (если применимо)
- [ ] Web env — только `VITE_*`
- [ ] Миграции: новые файлы, существующие не правились
- [ ] `ROADMAP` / `AGENTS` / `STRUCTURE` обновлены, если спринт закрыт
- [ ] Нет `any` (используйте `unknown` + Zod)

## Что пропускать при ревью

- `pnpm-lock.yaml`
- Сгенерированные типы (например, `database.types.ts`)
- `*.log`, кэш `.turbo`
