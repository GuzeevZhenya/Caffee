import { createClient } from "@supabase/supabase-js";
import type { BookingRealtimeEvent } from "@repo/shared";

/**
 * Единый источник Supabase env (Фаза 4):
 * SUPABASE_* → VITE_SUPABASE_* → NEXT_PUBLIC_SUPABASE_* (legacy).
 */
export function resolveSupabaseEnv(): { url: string; anonKey: string } | null {
  const url =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Broadcast события лока стола в канал Supabase Realtime "cafe-tables".
 * Best-effort: без env или при недоступном Realtime молча пропускаем —
 * клиенты всё равно получат статус при следующем refetch.
 */
export async function broadcastTableLock(event: BookingRealtimeEvent): Promise<void> {
  const env = resolveSupabaseEnv();
  if (!env) return;

  try {
    const supabase = createClient(env.url, env.anonKey);
    const channel = supabase.channel("cafe-tables");

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 3_000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    await channel.send({ type: "broadcast", event: "table-lock", payload: event });
    await supabase.removeChannel(channel);
  } catch (error) {
    console.warn("[api] broadcast не доставлен:", error instanceof Error ? error.message : error);
  }
}
