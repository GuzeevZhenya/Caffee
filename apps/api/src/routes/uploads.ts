import { existsSync, readFileSync } from "node:fs";
import { Hono } from "hono";
import { menuUploadDir } from "../lib/menu-photo";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** GET /api/uploads/menu/:file — локальные фото позиций меню. */
export const uploadsRoutes = new Hono().get("/menu/:file", (c) => {
  const file = c.req.param("file");
  if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(file)) {
    return c.json({ error: "not_found" }, 404);
  }
  const path = `${menuUploadDir()}/${file}`;
  if (!existsSync(path)) return c.json({ error: "not_found" }, 404);
  const ext = file.slice(file.lastIndexOf("."));
  return new Response(readFileSync(path), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
});
