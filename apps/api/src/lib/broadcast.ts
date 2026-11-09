import { createClient } from "@supabase/supabase-js";
import type { BookingRealtimeEvent } from "@repo/shared";

/**
 * Broadcast события лока стола в канал Supabase Realtime "cafe-tables".
 * Best-effort: без env или при недоступном Realtime молча пропускаем —
 * клиенты всё равно получат статус при следующем refetch.
 */
export async function broadcastTableLock(event: BookingRealtimeEvent): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return;

  try {
    const supabase = createClient(url, anonKey);
    const channel = supabase.channel("cafe-tables");

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 3_000); // не висим, если realtime недоступен
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
