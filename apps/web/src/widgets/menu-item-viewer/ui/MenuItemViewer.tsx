import { useAppDispatch, useAppSelector } from "@/app/store";
import { DrinkPhoto } from "@/entities/menu-item";
import { addItem } from "@/features/cart";
import {
  CustomizerPanel,
  initializeCustomization,
  selectConfiguration,
  selectCustomizerTotals,
} from "@/features/menu-customizer";
import { formatPrice } from "@/shared/lib";
import type { MenuItem3DConfig } from "@repo/shared";
import { useEffect } from "react";

interface MenuItemViewerProps {
  item: MenuItem3DConfig;
}

/**
 * Страница блюда: полный кадр фото (без обрезки) + состав.
 * Фон страницы — единый ink-900, как правая колонка.
 */
export function MenuItemViewer({ item }: MenuItemViewerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeCustomization(item));
  }, [dispatch, item]);

  const totals = useAppSelector((state) => selectCustomizerTotals(state, item));
  const configuration = useAppSelector((state) => selectConfiguration(state, item));

  const handleAddToCart = (): void => {
    dispatch(addItem({ item, configuration, unitPrice: totals.unitPrice }));
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="menu-item-photo-stage mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
        <DrinkPhoto
          item={item}
          fit="contain"
          className="w-full"
          imgClassName="block h-auto w-full object-contain"
          activeLayerIds={configuration.activeLayerIds}
        />
      </div>

      <aside className="grid min-w-0 content-start gap-4">
        <div>
          <h1 className="text-[clamp(22px,2.8vw,32px)] leading-tight">{item.name}</h1>
          <p className="mt-1 text-sm text-cream-dim">{item.description}</p>
        </div>

        <CustomizerPanel item={item} />

        <div className="grid gap-3 border border-ink-500/80 bg-ink-800/40 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-cream-dim">Итого · {totals.weightGrams} г</span>
            <span className="font-display text-2xl font-bold sm:text-3xl">
              {formatPrice(totals.unitPrice)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              [totals.calories, "ккал"],
              [totals.proteins, "белки"],
              [totals.fats, "жиры"],
              [totals.carbs, "углев."],
            ].map(([value, label]) => (
              <div key={label} className="border border-ink-500/80 px-1 py-2">
                <strong className="block font-display text-[14px] sm:text-[15px]">{value}</strong>
                <span className="text-[10px] uppercase tracking-[0.08em] text-cream-dim sm:text-[11px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddToCart} className="btn btn-primary w-full">
            В корзину — {formatPrice(totals.unitPrice)}
          </button>
        </div>
      </aside>
    </div>
  );
}
