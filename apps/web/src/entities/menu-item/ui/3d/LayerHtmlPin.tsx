import type { MenuItemLayerConfig } from "@repo/shared";
import { Html } from "@react-three/drei";

interface LayerHtmlPinProps {
  layer: MenuItemLayerConfig;
  /** Подсветка пина выбранного слоя */
  focused: boolean;
  onSelect?: (layerId: string) => void;
}

/**
 * 3D-аннотация слоя: выноска <Html> с названием, граммовкой и КБЖУ.
 * Позиционируется из layer.labelPosition относительно центра слоя;
 * сторона выноски (влево/вправо) определяется знаком X в labelPosition —
 * чередование зашито в данные слоёв.
 */
export function LayerHtmlPin({ layer, focused, onSelect }: LayerHtmlPinProps) {
  const side = layer.labelPosition[0] >= 0 ? "left" : "right";

  return (
    <Html position={layer.labelPosition} distanceFactor={6} zIndexRange={[20, 0]}>
      <button
        type="button"
        onClick={() => onSelect?.(layer.id)}
        className={`flex w-44 flex-col gap-0.5 rounded-lg border px-3 py-2 text-left shadow-md backdrop-blur transition ${
          focused
            ? "border-amber-500 bg-amber-50/95"
            : "border-neutral-200 bg-white/90 hover:border-neutral-400"
        }`}
        style={{ transform: side === "left" ? "translateX(-100%)" : undefined }}
      >
        <span className="text-xs font-semibold text-neutral-900">{layer.title}</span>
        <span className="text-[11px] text-neutral-500">
          {layer.nutrition.weightGrams} г · {layer.nutrition.calories} ккал
        </span>
        <span className="text-[10px] text-neutral-400">
          Б {layer.nutrition.proteins} · Ж {layer.nutrition.fats} · У {layer.nutrition.carbs}
        </span>
        {layer.priceModifier > 0 ? (
          <span className="text-[11px] font-medium text-emerald-700">
            +{layer.priceModifier.toFixed(2)} BYN
          </span>
        ) : null}
      </button>
    </Html>
  );
}
