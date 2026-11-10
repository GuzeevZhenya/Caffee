import { useAppDispatch, useAppSelector } from "@/app/store";
import { formatPrice } from "@/shared/lib";
import type { MenuItem3DConfig } from "@repo/shared";
import {
  resetCustomization,
  selectActiveLayerIds,
  selectCustomizerTotals,
  toggleLayer,
} from "../model/customizerSlice";

interface CustomizerPanelProps {
  item: MenuItem3DConfig;
}

/**
 * Панель кастомизации слоёв (дизайн mockup/item.html):
 * переключатели съёмных и платных слоёв, живой пересчёт цены и КБЖУ
 * через selectCustomizerTotals (calculateItemTotals).
 * Базовые несъёмные слои показаны заблокированными.
 */
export function CustomizerPanel({ item }: CustomizerPanelProps) {
  const dispatch = useAppDispatch();
  const activeLayerIds = useAppSelector((state) => selectActiveLayerIds(state, item));
  const totals = useAppSelector((state) => selectCustomizerTotals(state, item));

  // Слои сверху вниз — в порядке, обратном сборке блюда
  const layersTopDown = [...item.layers].sort((a, b) => b.layerOrder - a.layerOrder);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-cream-dim">
          Состав и слои
        </h3>
        <button
          type="button"
          onClick={() => dispatch(resetCustomization(item))}
          className="text-xs text-cream-dim underline-offset-2 transition hover:text-gold hover:underline"
        >
          Сбросить
        </button>
      </div>

      <ul className="grid gap-2" role="group" aria-label="Слои блюда">
        {layersTopDown.map((layer) => {
          const isActive = activeLayerIds.includes(layer.id);
          const isToggleable = layer.isRemovable || layer.isOptionalAdd;

          return (
            <li
              key={layer.id}
              className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 border border-ink-500 bg-ink-800/40 px-3 py-2.5 transition-opacity sm:gap-3 sm:px-3.5 sm:py-3 ${
                isActive ? "" : "opacity-45"
              }`}
            >
              {isToggleable ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`${layer.title}: ${isActive ? "убрать" : "добавить"}`}
                  onClick={() => dispatch(toggleLayer({ item, layer }))}
                  className={`relative h-6 w-11 flex-none rounded-full border transition-colors ${
                    isActive ? "border-gold bg-gold" : "border-ink-500 bg-ink-900"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] size-[18px] rounded-full transition-all ${
                      isActive ? "left-[22px] bg-ink-900" : "left-[2px] bg-cream-dim"
                    }`}
                  />
                </button>
              ) : (
                <span
                  className="grid h-6 w-11 flex-none place-items-center text-xs text-cream-dim"
                  title="Базовый слой"
                >
                  🔒
                </span>
              )}
              <div>
                <div className="text-sm font-bold">
                  {layer.title}
                  {layer.isOptionalAdd ? <span className="tag ml-2">опция</span> : null}
                </div>
                <div className="text-xs text-cream-dim">
                  {layer.nutrition.weightGrams} г · {layer.nutrition.calories} ккал
                </div>
              </div>
              <span className="min-w-12 text-right text-[13px] font-bold text-gold">
                {layer.priceModifier > 0
                  ? `+${formatPrice(layer.priceModifier)}`
                  : layer.isOptionalAdd
                    ? "0 BYN"
                    : "база"}
              </span>
              <span
                className="size-[18px] rounded-md border border-white/15"
                style={{ background: layer.material.colorHex }}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between rounded-m border border-ink-500 bg-ink-700 px-4 py-3">
        <span className="text-sm text-cream-dim">
          {totals.calories} ккал · {totals.weightGrams} г · Б {totals.proteins} / Ж {totals.fats} /
          У {totals.carbs}
        </span>
        <span className="font-display text-lg font-bold">{formatPrice(totals.unitPrice)}</span>
      </div>
    </div>
  );
}
