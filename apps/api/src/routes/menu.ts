import { databaseConfigured, databaseErrorText } from "../lib/database-configured";
import { applyDemoMenu } from "../lib/staff-board";
import { prisma, toMenuItem3DConfig } from "@repo/database";
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS, type MenuResponse } from "@repo/shared";
import { Hono } from "hono";

/**
 * GET /api/menu — категории и блюда с 3D-слоями.
 * Моки — только если DATABASE_URL не задан. С Supabase ошибка соединения
 * возвращает 503, а не витрину из моков.
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
      items: items.map(toMenuItem3DConfig).filter((item) => item.isAvailable),
      source: "database",
    };
    return c.json(response);
  } catch (error) {
    if (databaseConfigured()) {
      console.error(
        "[api/menu] Supabase недоступен:",
        databaseErrorText(error),
      );
      return c.json({ error: "database_unavailable" }, 503);
    }
    console.warn(
      "[api/menu] DATABASE_URL не задан, отдаю моки:",
      error instanceof Error ? error.message : error,
    );
    const response: MenuResponse = {
      categories: MOCK_CATEGORIES,
      items: MOCK_MENU_ITEMS.map(applyDemoMenu).filter((item) => item.isAvailable),
      source: "mock",
    };
    return c.json(response);
  }
});
