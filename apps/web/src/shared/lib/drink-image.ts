import type { MenuItem3DConfig } from "@repo/shared";

/**
 * Фото напитка/десерта для лендинга, витрины и страницы блюда.
 * Файлы лежат в public/drinks (скопированы из mockup/assets/drinks/sm).
 * Маппинг и по slug, и по id — у моков @repo/shared и данных БД они разные.
 * Возвращает null, если фото нет — тогда рендерим LayerStackSvg.
 */
const SLUG_TO_PHOTO: Record<string, string> = {
  // @repo/shared моки
  "latte-classic": "/drinks/flat-white.jpg",
  "raf-salted-caramel": "/drinks/raf-caramel.jpg",
  "cheesecake-berry": "/drinks/cheesecake.jpg",
  "matcha-strawberry": "/drinks/matcha-latte.jpg",
  "tiramisu-raspberry": "/drinks/tiramisu.jpg",
  // Данные в стиле макета (id = slug)
  "flat-white": "/drinks/flat-white.jpg",
  cappuccino: "/drinks/cappuccino.jpg",
  "raf-caramel": "/drinks/raf-caramel.jpg",
  "matcha-latte": "/drinks/matcha-latte.jpg",
  cheesecake: "/drinks/cheesecake.jpg",
  tiramisu: "/drinks/tiramisu.jpg",
  // Позиции, добавленные вручную (фото — ближайшие по смыслу из имеющихся)
  "iced-caramel-macchiato": "/drinks/cappuccino.jpg",
  "pistachio-raspberry-raf": "/drinks/raf-caramel.jpg",
  "iced-strawberry-matcha": "/drinks/matcha-latte.jpg",
  "berry-cheesecake": "/drinks/cheesecake.jpg",
  "classic-tiramisu": "/drinks/tiramisu.jpg",
  // Выпечка / круассаны
  "croissant-almond": "/drinks/croissant.png",
  "salmon-avocado-croissant": "/drinks/croissant.png",
  // Новые позиции (10.11.2026)
  "cappuccino-classic": "/drinks/cappuccino.jpg",
  "flat-white-oat": "/drinks/flat-white.jpg",
  "mocha-hazelnut": "/drinks/raf-caramel.jpg",
  "lemon-cheesecake": "/drinks/cheesecake.jpg",
};

/** Overlay asset for a removable / optional topping layer. */
export interface DrinkLayerOverlay {
  layerId: string;
  src: string;
  className?: string;
}

/** Resolved photo stack for a dish given the active customizer layers. */
export interface DrinkPresentation {
  base: string | null;
  overlays: Array<{ key: string; src: string; className?: string }>;
}

/**
 * Layer → transparent SVG overlay for dishes whose toppings should react
 * to the customizer. Keys are both slug and id for mock/DB parity.
 */
const ITEM_LAYER_OVERLAYS: Record<string, readonly DrinkLayerOverlay[]> = {
  "tiramisu-raspberry": [
    {
      layerId: "layer_tiramisu_berries",
      src: "/drinks/overlays/tiramisu-raspberries.svg",
    },
    {
      layerId: "layer_tiramisu_pistachio",
      src: "/drinks/overlays/tiramisu-pistachio.svg",
    },
  ],
  item_tiramisu_raspberry: [
    {
      layerId: "layer_tiramisu_berries",
      src: "/drinks/overlays/tiramisu-raspberries.svg",
    },
    {
      layerId: "layer_tiramisu_pistachio",
      src: "/drinks/overlays/tiramisu-pistachio.svg",
    },
  ],
  "cheesecake-berry": [
    {
      layerId: "layer_cheesecake_berries",
      src: "/drinks/overlays/cheesecake-berries.svg",
    },
    {
      layerId: "layer_cheesecake_extra_berries",
      src: "/drinks/overlays/cheesecake-extra-berries.svg",
    },
  ],
  item_cheesecake_berry: [
    {
      layerId: "layer_cheesecake_berries",
      src: "/drinks/overlays/cheesecake-berries.svg",
    },
    {
      layerId: "layer_cheesecake_extra_berries",
      src: "/drinks/overlays/cheesecake-extra-berries.svg",
    },
  ],
  "berry-cheesecake": [
    {
      layerId: "layer_ny_berries",
      src: "/drinks/overlays/cheesecake-berries.svg",
    },
    {
      layerId: "layer_ny_extra_berries",
      src: "/drinks/overlays/cheesecake-extra-berries.svg",
    },
  ],
  item_ny_cheesecake: [
    {
      layerId: "layer_ny_berries",
      src: "/drinks/overlays/cheesecake-berries.svg",
    },
    {
      layerId: "layer_ny_extra_berries",
      src: "/drinks/overlays/cheesecake-extra-berries.svg",
    },
  ],
};

export function drinkPhotoUrl(item: MenuItem3DConfig): string | null {
  const src = SLUG_TO_PHOTO[item.slug] ?? SLUG_TO_PHOTO[item.id] ?? null;
  /* cache-bust после feather-краёв студийных JPG */
  return src ? `${src}?v=feather1` : null;
}

/** All overlay definitions for an item (regardless of active layers). */
export function drinkLayerOverlays(item: MenuItem3DConfig): readonly DrinkLayerOverlay[] {
  return ITEM_LAYER_OVERLAYS[item.slug] ?? ITEM_LAYER_OVERLAYS[item.id] ?? [];
}

/**
 * Base photo + overlays filtered by `activeLayerIds`.
 * When `activeLayerIds` is omitted, overlays are empty (cards / hero).
 */
export function resolveDrinkPresentation(
  item: MenuItem3DConfig,
  activeLayerIds?: readonly string[],
): DrinkPresentation {
  const base = drinkPhotoUrl(item);
  if (activeLayerIds === undefined) {
    return { base, overlays: [] };
  }

  const active = new Set(activeLayerIds);
  const overlays = drinkLayerOverlays(item)
    .filter((overlay) => active.has(overlay.layerId))
    .map((overlay) => ({
      key: overlay.layerId,
      src: overlay.src,
      className: overlay.className,
    }));

  return { base, overlays };
}
