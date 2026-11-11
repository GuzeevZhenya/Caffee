import type { HallLayout } from "../types/hall-layout.types";

/**
 * Приблизительный план зала ~12×9 м (как комментарий в seed).
 * Окна — север (z≈−4.2), вход — юг, туалет — юго-запад, бар — восток.
 * Столы берутся из CafeTable.position3D / MOCK_TABLES.
 */
export const HALL_LAYOUT: HallLayout = {
  bounds: { minX: -6, minZ: -4.5, maxX: 6, maxZ: 4.5 },
  fixtures: [
    // Внешние стены (тонкие полосы)
    { id: "wall-n", kind: "wall", x: -6, z: -4.5, width: 12, depth: 0.25 },
    { id: "wall-s", kind: "wall", x: -6, z: 4.25, width: 12, depth: 0.25 },
    { id: "wall-w", kind: "wall", x: -6, z: -4.5, width: 0.25, depth: 9 },
    { id: "wall-e", kind: "wall", x: 5.75, z: -4.5, width: 0.25, depth: 9 },

    // Панорамные окна (север)
    { id: "win-1", kind: "window", x: -5.2, z: -4.45, width: 2.2, depth: 0.35, label: "Окно" },
    { id: "win-2", kind: "window", x: -2.4, z: -4.45, width: 2.2, depth: 0.35 },
    { id: "win-3", kind: "window", x: 0.4, z: -4.45, width: 2.2, depth: 0.35 },
    { id: "win-4", kind: "window", x: 3.2, z: -4.45, width: 2.2, depth: 0.35 },

    // Вход
    { id: "door-main", kind: "door", x: -0.9, z: 4.05, width: 1.8, depth: 0.4, label: "Вход" },

    // Туалет
    { id: "toilet", kind: "toilet", x: -5.7, z: 2.6, width: 2.2, depth: 1.6, label: "WC" },

    // Бар / витрина
    { id: "bar", kind: "bar", x: 4.2, z: -1.2, width: 1.4, depth: 3.2, label: "Бар" },

    // Зоны-подписи
    { id: "lbl-window", kind: "label", x: -1.5, z: -3.8, width: 3, depth: 0.4, label: "У окон" },
    { id: "lbl-center", kind: "label", x: -1.2, z: -0.3, width: 2.4, depth: 0.4, label: "Центр" },
    { id: "lbl-quiet", kind: "label", x: -2.5, z: 2.5, width: 2.4, depth: 0.4, label: "Тихая зона" },
    {
      id: "lbl-terrace",
      kind: "label",
      x: 2.4,
      z: 2.5,
      width: 2.6,
      depth: 0.4,
      label: "Терраса",
    },
  ],
};
