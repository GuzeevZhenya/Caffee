import { prisma, toMenuItem3DConfig } from "@repo/database";
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS, type MenuResponse } from "@repo/shared";
import { Hono } from "hono";

/**
 * GET /api/menu — категории и блюда с 3D-слоями.
 * Если БД недоступна (нет .env / не поднят Supabase) — отдаёт моки,
 * чтобы фронт и 3D-конструктор можно было разрабатывать без бэкенда.
 */
export const menuRoutes = new Hono().get("/", async (c) => {
  try {
    const [categories, items] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.menuItem.findMany({ include: { layers: true }, orderBy: { name: "asc" } }),
    ]);

    const response: MenuResponse = {
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        iconName: category.iconName,
        sortOrder: category.sortOrder,
      })),
      items: items.map(toMenuItem3DConfig),
      source: "database",
    };
    return c.json(response);
  } catch (error) {
    console.warn(
      "[api/menu] БД недоступна, отдаю моки:",
      error instanceof Error ? error.message : error,
    );
    const response: MenuResponse = {
      categories: MOCK_CATEGORIES,
      items: MOCK_MENU_ITEMS,
      source: "mock",
    };
    return c.json(response);
  }
});
