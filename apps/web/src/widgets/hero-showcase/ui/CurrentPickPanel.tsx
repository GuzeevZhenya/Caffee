import { useAppDispatch, useAppSelector } from "@/app/store";
import { addItem, selectCartItems } from "@/features/cart";
import { formatPrice } from "@/shared/lib";
import {
  calculateItemTotals,
  getDefaultActiveLayerIds,
  getDefaultConfiguration,
  type MenuItem3DConfig,
} from "@repo/shared";
import { useRef, useState } from "react";
import { Link } from "react-router";

interface CurrentPickPanelProps {
  item: MenuItem3DConfig;
}

/** Панель Current Pick: КБЖУ-пилюли, цена, переход к составу и «В корзину» со счётчиком */
export function CurrentPickPanel({ item }: CurrentPickPanelProps) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));

  // Сколько этого напитка уже в корзине
  const countInCart = useAppSelector((state) =>
    selectCartItems(state)
      .filter((line) => line.menuItemId === item.id)
      .reduce((sum, line) => sum + line.quantity, 0),
  );

  const handleAddToCart = (): void => {
    dispatch(
      addItem({
        item,
        configuration: getDefaultConfiguration(item),
        unitPrice: totals.unitPrice,
      }),
    );
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <aside
      key={item.id}
      className="animate-cp-in order-3 border-gold pt-4 max-lg:border-t-0 lg:border-t"
      aria-live="polite"
    >
      <div className="max-lg:text-center">
        <span className="text-xs uppercase tracking-[0.24em] text-cream-dim">Current Pick</span>
        <h2 className="my-2 font-display text-[clamp(26px,2.6vw,36px)] font-semibold italic">
          {item.name}
        </h2>
        <p className="min-h-[3.2em] max-w-[34ch] text-sm text-cream-dim max-lg:mx-auto">
          {item.description}
        </p>
        <div className="my-4 flex flex-wrap gap-2 max-lg:justify-center">
          <span className="rounded-full border border-ink-500 px-3 py-1 text-xs font-bold text-cream-dim">
            {totals.calories} ккал
          </span>
          <span className="rounded-full border border-ink-500 px-3 py-1 text-xs font-bold text-cream-dim">
            белки {totals.proteins} г
          </span>
          <span className="rounded-full border border-ink-500 px-3 py-1 text-xs font-bold text-cream-dim">
            жиры {totals.fats} г
          </span>
          <span className="rounded-full border border-ink-500 px-3 py-1 text-xs font-bold text-cream-dim">
            углев. {totals.carbs} г
          </span>
        </div>
        <p className="font-display text-[32px] font-bold">{formatPrice(totals.unitPrice)}</p>
        <div className="mt-4 flex flex-wrap gap-3 max-lg:justify-center">
          <Link to={`/menu/${item.id}`} className="btn btn-primary">
            Смотреть состав
          </Link>
          <button type="button" onClick={handleAddToCart} className="btn btn-ghost">
            {added ? "Добавлено ✓" : countInCart > 0 ? `В корзине · ${countInCart}` : "В корзину"}
          </button>
        </div>
      </div>
    </aside>
  );
}
