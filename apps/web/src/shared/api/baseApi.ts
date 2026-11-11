import { getGuestId } from "@/shared/lib/guest-id";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const STAFF_TOKEN_KEY = "tactile.staff.token";

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
      const guestId = getGuestId();
      if (guestId) headers.set("x-guest-id", guestId);
      try {
        const token = localStorage.getItem(STAFF_TOKEN_KEY);
        if (token) headers.set("authorization", `Bearer ${token}`);
      } catch {
        // ignore
      }
      return headers;
    },
  }),
  tagTypes: ["Menu", "Tables", "Orders", "Staff"],
  endpoints: () => ({}),
});
