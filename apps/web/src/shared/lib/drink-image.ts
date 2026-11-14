import { MENU_PREVIEW_BY_SLUG, type MenuItem3DConfig } from "@repo/shared";

/**
 * Фото напитка/десерта. Сначала previewImageUrl из API, иначе словарь shared.
 */

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
  if (item.previewImageUrl) return item.previewImageUrl;
  const src = MENU_PREVIEW_BY_SLUG[item.slug] ?? MENU_PREVIEW_BY_SLUG[item.id] ?? null;
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
