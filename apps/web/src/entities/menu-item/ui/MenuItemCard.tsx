import type { ReactNode } from "react";
import { Link } from "react-router";
import { formatPrice } from "@/shared/lib";
import { calculateItemTotals, getDefaultActiveLayerIds, type MenuItem3DConfig } from "@repo/shared";
import { LayerStackSvg } from "./LayerStackSvg";

interface MenuItemCardProps {
  item: MenuItem3DConfig;
  /** Название категории для тега над визуалом */
  categoryName?: string;
  /** Слот под действия (кнопки фич: «В корзину», «Конструктор») */
  action?: ReactNode;
}

/**
 * Карточка блюда на витрине (дизайн mockup/menu.html):
 * визуал со слоями, название + цена, состав, счётчик слоёв.
 * Цена/КБЖУ — дефолтный рецепт через shared-калькулятор.
 */
export function MenuItemCard({ item, categoryName, action }: MenuItemCardProps) {
  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));

  return (
    <article className="card grid gap-4 !transform-none p-4">
      <Link
        to={`/menu/${item.id}`}
        className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-m transition-transform"
        aria-label={`Открыть ${item.name}`}
      >
        <span
          className="absolute inset-0"
          style={{
            background: `color-mix(in oklch, ${item.ambientColorHex} 20%, var(--color-ink-700))`,
          }}
        />
        {categoryName ? <span className="tag absolute left-3 top-3">{categoryName}</span> : null}
        <span className="relative transition-transform duration-300 hover:scale-[1.05] hover:-translate-y-1">
          <LayerStackSvg item={item} />
        </span>
      </Link>

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[19px]">{item.name}</h2>
        <span className="font-display font-bold">{formatPrice(totals.unitPrice)}</span>
      </div>
      <p className="text-sm text-cream-dim">{item.description}</p>
      <span className="text-[13px] font-bold text-gold">
        {item.layers.length} слоёв · {totals.calories} ккал
      </span>
      {action ? <div className="flex gap-2">{action}</div> : null}
    </article>
  );
}
