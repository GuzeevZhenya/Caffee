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
 * Страница блюда: фото-карточка слева, состав и итог справа.
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
    <div className="grid items-stretch gap-6 md:grid-cols-[minmax(240px,0.92fr)_minmax(0,1.08fr)] md:gap-8 lg:gap-10">
      <figure className="menu-item-photo-frame m-0 w-full">
        <div className="menu-item-photo-frame__mat">
          <div className="menu-item-photo-frame__inner">
            <DrinkPhoto
              item={item}
              fit="cover"
              className="absolute inset-0"
              imgClassName="absolute inset-0 size-full object-cover"
              activeLayerIds={configuration.activeLayerIds}
            />
          </div>
        </div>
      </figure>

      <aside className="grid min-w-0 content-start gap-5">
        <div>
          <h1 className="text-[clamp(24px,3vw,34px)] leading-tight">{item.name}</h1>
          <p className="mt-1 text-sm text-cream-dim">{item.description}</p>
        </div>

        <CustomizerPanel item={item} />

        <div className="grid gap-4 rounded-m border border-ink-500 bg-ink-700 p-5">
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
              <div key={label} className="rounded-s border border-ink-500 px-1 py-2">
                <strong className="block font-display text-[15px]">{value}</strong>
                <span className="text-[11px] uppercase tracking-[0.08em] text-cream-dim">
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
