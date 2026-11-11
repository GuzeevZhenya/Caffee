import type { ReactNode } from "react";
import { Link } from "react-router";
import { formatPrice } from "@/shared/lib";
import { calculateItemTotals, getDefaultActiveLayerIds, type MenuItem3DConfig } from "@repo/shared";
import { DrinkPhoto } from "./DrinkPhoto";

interface MenuItemCardProps {
  item: MenuItem3DConfig;
  /** Название категории для тега над визуалом */
  categoryName?: string;
  /** Слот под действия (кнопки фич: «В корзину», «Состав») */
  action?: ReactNode;
}

/**
 * Карточка меню: фото edge-to-edge без серой вложенной рамки и без внутренних скруглений.
 */
export function MenuItemCard({ item, categoryName, action }: MenuItemCardProps) {
  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));

  return (
    <article className="card grid !transform-none gap-0 overflow-hidden !rounded-l !p-0">
      <Link
        to={`/menu/${item.id}`}
        className="group relative block aspect-[4/3] w-full overflow-hidden bg-ink-900"
        aria-label={`Открыть ${item.name}`}
      >
        {categoryName ? <span className="tag absolute left-3 top-3 z-10">{categoryName}</span> : null}
        <DrinkPhoto
          item={item}
          imgClassName="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="grid gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h2 className="text-[17px] leading-snug sm:text-[19px]">{item.name}</h2>
          <span className="shrink-0 font-display font-bold">{formatPrice(totals.unitPrice)}</span>
        </div>
        <p className="line-clamp-2 text-sm text-cream-dim sm:line-clamp-3">{item.description}</p>
        <span className="text-[13px] font-bold text-gold">
          {item.layers.length} слоёв · {totals.calories} ккал
        </span>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </article>
  );
}
