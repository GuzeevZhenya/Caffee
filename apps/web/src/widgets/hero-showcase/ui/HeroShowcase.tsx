import { useGetMenuQuery } from "@/entities/menu-item";
import { drinkPhotoUrl } from "@/shared/lib";
import type { MenuItem3DConfig } from "@repo/shared";
import { useState } from "react";
import { CurrentPickPanel } from "./CurrentPickPanel";
import { HeroCarousel } from "./HeroCarousel";

/**
 * Hero-витрина лендинга (по макету showcase):
 * слева — заголовок и статистика, по центру — фото активного напитка,
 * справа — Current Pick, снизу — карусель с перестановкой слотов.
 */
export function HeroShowcase() {
  const { data, isLoading, isError } = useGetMenuQuery();

  // Карусель и центральное фото показывают только позиции с фото — без плейсхолдеров
  const heroItems = data ? data.items.filter((item) => drinkPhotoUrl(item) !== null) : [];

  const initialCenter =
    heroItems.length > 0
      ? (heroItems[Math.max(0, Math.floor((Math.min(heroItems.length, 5) - 1) / 2))] ?? null)
      : null;
  const [centerItem, setCenterItem] = useState<MenuItem3DConfig | null>(initialCenter);

  if (isLoading) {
    return <p className="wrap py-16 text-cream-dim">Загружаю витрину…</p>;
  }
  if (isError || !data) {
    return (
      <p className="wrap py-16 text-rose-warm">
        Не удалось загрузить меню. Проверьте, что запущен apps/api (pnpm dev в корне поднимает оба).
      </p>
    );
  }

  // Центральный напиток приходит из HeroCarousel (первый тик после монтирования)
  const photo = centerItem ? drinkPhotoUrl(centerItem) : null;

  return (
    <section className="relative flex min-h-[calc(100dvh-68px)] flex-col overflow-clip">
      {/* золотое свечение за центральным фото */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[44%] size-[min(560px,60vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,oklch(0.72_0.10_62/0.22),transparent_72%)]"
      />
      {/* декоративные зёрна */}
      <svg
        aria-hidden="true"
        className="bean pointer-events-none absolute left-[4%] top-[12%] opacity-10 blur-[1px]"
        width="90"
        height="90"
        viewBox="0 0 40 40"
      >
        <ellipse cx="20" cy="20" rx="14" ry="19" fill="#5b3a1e" transform="rotate(24 20 20)" />
        <path
          d="M13 8 Q22 20 13 32"
          stroke="#2c1a0d"
          strokeWidth="3"
          fill="none"
          transform="rotate(24 20 20)"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="bean pointer-events-none absolute bottom-[18%] right-[5%] opacity-10 blur-[1px]"
        width="110"
        height="110"
        viewBox="0 0 40 40"
      >
        <ellipse cx="20" cy="20" rx="14" ry="19" fill="#4a2d16" transform="rotate(-30 20 20)" />
        <path
          d="M13 8 Q22 20 13 32"
          stroke="#241206"
          strokeWidth="3"
          fill="none"
          transform="rotate(-30 20 20)"
        />
      </svg>

      <div className="wrap relative grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Левая колонка */}
        <div className="order-1 text-center lg:text-left">
          <p className="eyebrow justify-center lg:justify-start">Craft coffee &amp; bakery</p>
          <h1 className="mt-3 text-[clamp(38px,4.4vw,62px)] font-semibold leading-[1.08]">
            Кофе, который можно <em className="italic text-gold">разобрать по слоям</em>
          </h1>
          <p className="mx-auto mt-4 max-w-[40ch] text-[15.5px] text-cream-dim lg:mx-0">
            Собираем напиток по слоям — с граммовкой, КБЖУ и ценой, которые пересчитываются на
            глазах. Уберите сироп, добавьте шот: чек честный до копейки.
          </p>
          <div className="mt-6 flex justify-center gap-8 text-[13px] text-cream-dim lg:justify-start">
            <span>
              <strong className="block font-display text-[22px] text-cream">
                {data.items.length}
              </strong>
              позиций меню
            </span>
            <span>
              <strong className="block font-display text-[22px] text-cream">6</strong>
              столов в зале
            </span>
            <span>
              <strong className="block font-display text-[22px] text-cream">10 мин</strong>
              холд брони
            </span>
          </div>
        </div>

        {/* Центральное фото: скруглённый блок, заполняет колонку как фон */}
        <div className="relative order-2 h-[clamp(240px,36vh,400px)] overflow-hidden rounded-l lg:h-[clamp(280px,44vh,460px)]">
          {photo && centerItem ? (
            <img
              src={photo}
              alt={centerItem.name}
              className="absolute inset-0 size-full object-cover"
            />
          ) : null}
        </div>

        {/* Current Pick */}
        {centerItem ? <CurrentPickPanel item={centerItem} /> : null}
      </div>

      {/* Карусель */}
      <HeroCarousel items={heroItems} onCenterItemChange={setCenterItem} />
    </section>
  );
}
