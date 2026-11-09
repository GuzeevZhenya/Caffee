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

/** Строка состава: топ-3 базовых слоя по весу с процентами (как compLine в макете) */
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

/** Карточка блюда в сетке «Популярные»: фото, состав, цена, круглая кнопка «+» */
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
    <article className="card grid gap-3 !transform-none p-4 transition-[border-color,transform] hover:-translate-y-1.5">
      <Link
        to={`/menu/${item.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-m"
        aria-label={`Открыть ${item.name}`}
      >
        <img
          src={photo}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 hover:scale-[1.06]"
        />
      </Link>
      <h3 className="text-[21px]">{item.name}</h3>
      <p className="text-xs text-cream-dim">{compositionLine(item)}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="font-display text-[22px] font-bold">{formatPrice(totals.unitPrice)}</span>
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Добавить ${item.name} в корзину`}
          className={`grid size-[46px] place-items-center rounded-full border-0 text-2xl font-bold transition-all duration-200 hover:rotate-90 hover:scale-110 ${
            added ? "bg-mint text-ink-900" : "bg-gold text-ink-900 hover:bg-cream"
          }`}
        >
          {added ? "✓" : "+"}
        </button>
      </div>
    </article>
  );
}
