import { databaseConfigured, databaseErrorText } from "../lib/database-configured";
import { allDemoMenuItems } from "../lib/staff-board";
import { prisma, toMenuItem3DConfig } from "@repo/database";
import { MOCK_CATEGORIES, type MenuResponse } from "@repo/shared";
import { Hono } from "hono";

/**
 * GET /api/menu — категории и блюда с 3D-слоями.
 * Если Supabase недоступен — отдаём моки, витрина не остаётся пустой.
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
    console.warn(
      databaseConfigured()
        ? `[api/menu] Supabase недоступен, отдаю моки: ${databaseErrorText(error)}`
        : `[api/menu] DATABASE_URL не задан, отдаю моки: ${databaseErrorText(error)}`,
    );
    const response: MenuResponse = {
      categories: MOCK_CATEGORIES,
      items: allDemoMenuItems().filter((item) => item.isAvailable),
      source: "mock",
    };
    return c.json(response);
  }
});
