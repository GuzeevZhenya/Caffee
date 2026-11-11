import { useAppDispatch } from "@/app/store";
import { addItem } from "@/features/cart";
import { drinkPhotoUrl, formatPrice } from "@/shared/lib";
import {
  calculateItemTotals,
  getDefaultActiveLayerIds,
  getDefaultConfiguration,
  type MenuItem3DConfig,
} from "@repo/shared";
import { useState } from "react";
import { Link } from "react-router";
import type { PopularCardProps } from "./types";

/** Строка состава: топ-3 базовых слоя по весу с процентами */
function compositionLine(item: MenuItem3DConfig): string {
  const base = item.layers.filter((l) => l.isDefault && !l.isOptionalAdd);
  const total = base.reduce((s, l) => s + l.nutrition.weightGrams, 0) || 1;
  return base
    .filter((l) => l.nutrition.weightGrams > 0)
    .sort((a, b) => b.nutrition.weightGrams - a.nutrition.weightGrams)
    .slice(0, 3)
    .map((l) => `${Math.round((l.nutrition.weightGrams / total) * 100)}% ${l.title.toLowerCase()}`)
    .join(" · ");
}

/** Карточка «Популярные»: фото на всю ширину блока, без серой подложки */
export function PopularCard({ item }: PopularCardProps) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));
  const photo = drinkPhotoUrl(item);
  if (!photo) return null;

  const handleAdd = (): void => {
    dispatch(
      addItem({
        item,
        configuration: getDefaultConfiguration(item),
        unitPrice: totals.unitPrice,
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  return (
    <article className="card grid !transform-none gap-0 overflow-hidden !rounded-l !p-0 transition-[border-color,transform] hover:-translate-y-1">
      <Link
        to={`/menu/${item.id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden"
        aria-label={`Открыть ${item.name}`}
      >
        <img
          src={photo}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 hover:scale-[1.05]"
        />
      </Link>
      <div className="grid gap-2 p-3 sm:gap-3 sm:p-4">
        <h3 className="line-clamp-2 text-[15px] leading-snug sm:text-[20px]">{item.name}</h3>
        <p className="hidden text-xs text-cream-dim sm:line-clamp-2 sm:block">{compositionLine(item)}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[17px] font-bold sm:text-[22px]">
            {formatPrice(totals.unitPrice)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Добавить ${item.name} в корзину`}
            className={`grid size-9 place-items-center rounded-full border-0 text-xl font-bold transition-all duration-200 hover:rotate-90 hover:scale-110 sm:size-[46px] sm:text-2xl ${
              added ? "bg-mint text-ink-900" : "bg-gold text-ink-900 hover:bg-cream"
            }`}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
}
