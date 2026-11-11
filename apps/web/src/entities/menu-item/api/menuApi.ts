import { baseApi } from "@/shared/api/baseApi";
import { mockMenuResponse } from "@/shared/lib";
import type { MenuResponse } from "@repo/shared";

/**
 * Загрузка 3D-меню и категорий (GET /api/menu).
 * Моки — если API не запущен. 503 (Supabase задан, но не отвечает) показываем как ошибку.
 */
export const menuApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query<MenuResponse, void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const result = await baseQuery("menu");
        if (result.error && "status" in result.error && result.error.status === 503) {
          return { error: result.error };
        }
        if (result.error || result.data === undefined) {
          return { data: mockMenuResponse() };
        }
        return { data: result.data as MenuResponse };
      },
      providesTags: ["Menu"],
    }),
  }),
  // true — иначе Vite HMR оставляет старый inject без queryFn и UI вечно в isLoading
  overrideExisting: true,
});

export const { useGetMenuQuery } = menuApi;
