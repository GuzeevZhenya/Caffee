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
 * Страница блюда: полномасштабное фото слева, справа — «указатели» слоёв
 * (название, объём, ккал) с переключателями кастомизации и итоговый блок.
 * Цена и КБЖУ пересчитываются через shared-калькулятор.
 */
export function MenuItemViewer({ item }: MenuItemViewerProps) {
  const dispatch = useAppDispatch();

  // Лениво инициализируем дефолтный рецепт при открытии блюда
  useEffect(() => {
    dispatch(initializeCustomization(item));
  }, [dispatch, item]);

  const totals = useAppSelector((state) => selectCustomizerTotals(state, item));
  const configuration = useAppSelector((state) => selectConfiguration(state, item));

  const handleAddToCart = (): void => {
    dispatch(addItem({ item, configuration, unitPrice: totals.unitPrice }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      {/* Полномасштабное фото блюда */}
      <div className="relative grid min-h-[440px] place-items-center overflow-hidden rounded-l border border-ink-500 bg-ink-700 lg:min-h-[560px]">
        <DrinkPhoto
          item={item}
          className="size-full"
          imgClassName="absolute inset-0 size-full object-contain p-6 drop-shadow-[0_24px_48px_oklch(0_0_0/0.55)]"
        />
      </div>

      <aside className="grid content-start gap-5">
        <div>
          <h1 className="text-[clamp(24px,3vw,34px)]">{item.name}</h1>
          <p className="mt-1 text-sm text-cream-dim">{item.description}</p>
        </div>

        <CustomizerPanel item={item} />

        <div className="grid gap-4 rounded-m border border-ink-500 bg-ink-700 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-cream-dim">Итого · {totals.weightGrams} г</span>
            <span className="font-display text-3xl font-bold">{formatPrice(totals.unitPrice)}</span>
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
          {/* {configuration.removedTitles.length > 0 || configuration.addedTitles.length > 0 ? (
            <p className="text-xs text-cream-dim">
              {configuration.removedTitles.length > 0
                ? `Без: ${configuration.removedTitles.join(", ")}. `
                : ""}
              {configuration.addedTitles.length > 0
                ? `Добавлено: ${configuration.addedTitles.join(", ")}.`
                : ""}
            </p>
          ) : null} */}
        </div>
      </aside>
    </div>
  );
}
