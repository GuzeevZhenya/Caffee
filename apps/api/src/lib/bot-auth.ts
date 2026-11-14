import { timingSafeEqual } from "node:crypto";
import type { Context } from "hono";

/** Секрет бота: отдельный ключ или тот же BOT_TOKEN из корневого .env. */
export function botSharedSecret(): string {
  return process.env.BOT_API_SECRET?.trim() || process.env.BOT_TOKEN?.trim() || "";
}

function secretsEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function rejectUnlessBot(c: Context): Response | null {
  const expected = botSharedSecret();
  const got = c.req.header("x-bot-secret") ?? "";
  if (!expected || !secretsEqual(expected, got)) {
    return c.json({ error: "unauthorized" }, 401);
  }
  return null;
}
