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
};

export function drinkPhotoUrl(item: MenuItem3DConfig): string | null {
  return SLUG_TO_PHOTO[item.slug] ?? SLUG_TO_PHOTO[item.id] ?? null;
}
