import { drinkPhotoUrl, formatPrice } from "@/shared/lib";
import { calculateItemTotals, getDefaultActiveLayerIds, type MenuItem3DConfig } from "@repo/shared";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const AUTO_MS = 10_000;
const CAROUSEL_LIMIT = 5;

interface HeroCarouselProps {
  /** Позиции карусели (только с фото) */
  items: MenuItem3DConfig[];
  /** Вызывается при каждой смене центрального слота, включая первый рендер */
  onCenterItemChange: (item: MenuItem3DConfig) => void;
}

/** Круглая фотография напитка (в карусели только позиции с фото) */
function CarouselThumb({ item }: { item: MenuItem3DConfig }) {
  const photo = drinkPhotoUrl(item);
  if (!photo) return null;
  return (
    <img
      src={photo}
      alt=""
      loading="lazy"
      className="size-full object-cover transition-transform duration-500 [transform:scale(1.06)] group-active:[transform:scale(1.12)]"
    />
  );
}

/**
 * Карусель hero-витрины: круглые превью с FLIP-перестановкой слотов
 * и автопрокруткой. Клик по центральному слоту открывает страницу блюда.
 */
export function HeroCarousel({ items, onCenterItemChange }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [slotIds, setSlotIds] = useState<string[]>(() =>
    items.slice(0, CAROUSEL_LIMIT).map((item) => item.id),
  );
  const slotsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const flipRects = useRef<number[] | null>(null);
  const [autoTick, setAutoTick] = useState(0);

  const n = slotIds.length;
  const CENTER = Math.max(0, Math.floor((n - 1) / 2));

  const itemById = (id: string | undefined): MenuItem3DConfig | null =>
    items.find((candidate) => candidate.id === id) ?? null;

  // Сообщаем родителю о центральном слоте (первая отрисовка и каждая смена)
  const centerItem = itemById(slotIds[CENTER]);
  useEffect(() => {
    if (centerItem) onCenterItemChange(centerItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerItem?.id]);

  const advanceCarousel = (): void => {
    if (slotIds.length < 2) return;
    flipRects.current = slotsRef.current.map((el) => el?.getBoundingClientRect().left ?? 0);
    setSlotIds((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]!]));
  };

  useEffect(() => {
    if (slotIds.length < 2) return;

    // не крутим, если вкладка не видна — не копим тики
    const tick = (): void => {
      if (document.visibilityState !== "visible") return;
      advanceCarousel();
    };

    const id = window.setInterval(tick, AUTO_MS);
    return () => window.clearInterval(id);
    // autoTick в зависимостях = рестарт интервала при ручном выборе
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIds.length, autoTick]);

  // FLIP-анимация: после перестановки слотов сдвигаем их от старых позиций
  useLayoutEffect(() => {
    const before = flipRects.current;
    flipRects.current = null;
    if (!before) return;
    slotsRef.current.forEach((el, i) => {
      if (!el) return;
      const dx = (before[i] ?? 0) - el.getBoundingClientRect().left;
      if (!dx) return;
      el.style.transition = "none";
      el.style.transform = `translateX(${dx}px)`;
      void el.getBoundingClientRect(); // reflow
      el.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    });
  }, [slotIds]);

  const handleSlotClick = (j: number): void => {
    setAutoTick((t) => t + 1);

    if (j === CENTER) {
      const id = slotIds[CENTER];
      if (id) navigate(`/menu/${id}`);
      return;
    }
    flipRects.current = slotsRef.current.map((el) => el?.getBoundingClientRect().left ?? 0);
    setSlotIds((prev) => {
      const next = [...prev];
      const a = next[CENTER];
      const b = next[j];
      if (a === undefined || b === undefined) return prev;
      next[CENTER] = b;
      next[j] = a;
      return next;
    });
  };

  return (
    <div
      className="flex justify-center gap-[clamp(10px,3vw,42px)] overflow-x-auto px-4 pb-7 pt-5 max-lg:snap-x max-lg:justify-start lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Популярные напитки"
    >
      {slotIds.map((id, i) => {
        const item = itemById(id);
        if (!item) return null;
        const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));
        const active = i === CENTER;
        return (
          <button
            key={`${i}-${id}`}
            type="button"
            ref={(el) => {
              slotsRef.current[i] = el;
            }}
            onClick={() => handleSlotClick(i)}
            aria-label={
              active
                ? `${item.name} (активный — открыть подробности)`
                : `${item.name} (показать по центру)`
            }
            className={`group grid w-[clamp(86px,10vw,128px)] flex-none snap-center justify-items-center gap-1.5 p-1.5 transition-colors ${
              active ? "text-cream" : "text-cream-dim hover:text-cream"
            }`}
          >
            <span
              className={`size-[clamp(64px,8vw,104px)] overflow-hidden rounded-full border bg-ink-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active
                  ? "-translate-y-2 scale-[1.22] border-gold shadow-[0_0_0_5px_oklch(0.72_0.10_62/0.15),0_18px_40px_oklch(0_0_0/0.5)]"
                  : "border-ink-500"
              }`}
            >
              <CarouselThumb item={item} />
            </span>
            <span
              className={`mt-1.5 font-display text-sm font-semibold ${
                active ? "text-cream" : "text-cream-dim"
              }`}
            >
              {item.name}
            </span>
            <span className="text-xs font-bold">{formatPrice(totals.unitPrice)}</span>
          </button>
        );
      })}
    </div>
  );
}
