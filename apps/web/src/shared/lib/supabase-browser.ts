import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Браузерный клиент Supabase для Realtime-подписок (статусы столов).
 * Возвращает null, если env не заданы — dev-режим без Supabase,
 * bookingApi просто работает без realtime-обновлений (refetch по фокусу).
 *
 * В Vite публичные переменные — import.meta.env.VITE_*.
 */

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) return null;

  browserClient = createClient(url, anonKey);
  return browserClient;
}
