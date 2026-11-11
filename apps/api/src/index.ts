import { serve } from "@hono/node-server";
import { prisma } from "@repo/database";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { databaseConfigured } from "./lib/database-configured";
import { authRoutes } from "./routes/auth";
import { menuRoutes } from "./routes/menu";
import { ordersRoutes } from "./routes/orders";
import { staffRoutes } from "./routes/staff";
import { tablesRoutes } from "./routes/tables";

/**
 * HTTP API Tactile Coffee (выделено из Next.js API routes при переходе на SPA).
 * В dev фронт ходит сюда через Vite-прокси: /api → http://localhost:4000.
 */
const app = new Hono().basePath("/api");

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
app.route("/staff", staffRoutes);

app.notFound((c) => c.json({ error: "not_found" }, 404));

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🌐 API Tactile Coffee: http://localhost:${info.port}/api`);
});
