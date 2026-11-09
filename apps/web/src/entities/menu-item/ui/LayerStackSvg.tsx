import type { MenuItem3DConfig } from "@repo/shared";

/**
 * Мини-визуал блюда: слои, разнесённые по вертикали (как в mockup/menu.html).
 * Используется в карточках меню и как fallback вместо фото на лендинге.
 * По умолчанию — фиксированный размер 120×110; через className можно
 * растянуть на контейнер (например, во весь круглый превью-элемент).
 */
export function LayerStackSvg({
  item,
  className,
}: {
  item: MenuItem3DConfig;
  className?: string;
}) {
  const layers = [...item.layers].sort((a, b) => a.layerOrder - b.layerOrder);
  const n = layers.length;
  const rects = layers.map((layer, i) => {
    const y = 88 - (i * 78) / Math.max(n - 1, 1);
    const w = 44 + layer.radiusScale * 14;
    const h = 6 + layer.heightScale * 10;
    return (
      <rect
        key={layer.id}
        x={60 - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={3.5}
        fill={layer.material.colorHex}
        opacity={layer.material.opacity}
      />
    );
  });

  return (
    <svg
      width="120"
      height="110"
      viewBox="0 0 120 110"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      {rects}
    </svg>
  );
}
