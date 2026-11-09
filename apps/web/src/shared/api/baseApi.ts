import { getGuestId } from "@/shared/lib/guest-id";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Базовый API-слайс RTK Query.
 * Доменные эндпоинты инжектятся из entities (menu-item, table, order).
 * Запросы идут на /api — в dev проксируются Vite на apps/api (Hono, :4000).
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Анонимный гость — владелец Redis-локов столов (до авторизации)
      const guestId = getGuestId();
      if (guestId) headers.set("x-guest-id", guestId);
      return headers;
    },
  }),
  tagTypes: ["Menu", "Tables", "Orders"],
  endpoints: () => ({}),
});
