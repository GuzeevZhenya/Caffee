# REVIEW.md — чек-лист код-ревью

Открывать на ревью. Сверка с `AGENTS.md` и `STRUCTURE.md`.

## Чек-лист

- [ ] Заголовок в стиле Conventional Commits, описание по-русски, без `Co-authored-by`
- [ ] `pnpm ci:check` зелёный (`lint` + `typecheck` + `build`)
- [ ] В diff нет секретов (`.env`, ключи, токены)
- [ ] `apps/web` не импортирует `@repo/database`; данные идут через RTK Query
- [ ] FSD: импорты только вниз, наружу слайса — только `index.ts`
- [ ] Расчёт цены и КБЖУ не скопирован мимо `calculateItemTotals`
- [ ] Внешние данные валидируются Zod из `packages/shared`
- [ ] Статусы — константы shared, не новые строковые литералы
- [ ] В браузер уходят только `VITE_*`
- [ ] Правка `schema.prisma` сопровождается `pnpm db:generate` и маппером, если поле уходит на клиент
- [ ] Закрытый спринт отражён в `AGENTS.md` или в `.docs/memory-sprint-*.md`
- [ ] Нет `any` без причины (`unknown` + Zod)

## Не разбирать в ревью

- `pnpm-lock.yaml`
- Сгенерированный Prisma Client
- `*.log`, кэш `.turbo`
