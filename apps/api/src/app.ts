import { prisma } from "@repo/database";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { databaseConfigured } from "./lib/database-configured";
import { authRoutes } from "./routes/auth";
import { botRoutes } from "./routes/bot";
import { menuRoutes } from "./routes/menu";
import { ordersRoutes } from "./routes/orders";
import { staffRoutes } from "./routes/staff";
import { tablesRoutes } from "./routes/tables";
import { uploadsRoutes } from "./routes/uploads";

/**
 * HTTP API Tactile Coffee.
 * Dev: `index.ts` слушает :4000. Prod: тот же app отдаёт Vercel (`api/[[...route]].ts`).
 */
export const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());

app.get("/health", async (c) => {
  if (!databaseConfigured()) {
    return c.json({ ok: true, service: "tactile-coffee-api", database: "unconfigured" });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ ok: true, service: "tactile-coffee-api", database: "up" });
  } catch {
    return c.json({ ok: false, service: "tactile-coffee-api", database: "down" }, 503);
  }
});

app.route("/auth", authRoutes);
app.route("/menu", menuRoutes);
app.route("/tables", tablesRoutes);
app.route("/orders", ordersRoutes);
app.route("/bot", botRoutes);
app.route("/staff", staffRoutes);
app.route("/uploads", uploadsRoutes);

app.notFound((c) => c.json({ error: "not_found" }, 404));
