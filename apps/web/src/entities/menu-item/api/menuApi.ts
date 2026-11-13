import { baseApi } from "@/shared/api/baseApi";
import { mockMenuResponse } from "@/shared/lib";
import type { MenuResponse } from "@repo/shared";

/**
 * Загрузка меню (GET /api/menu).
 * Сбой API или Supabase — моки из @repo/shared, витрина не пустая.
 */
export const menuApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query<MenuResponse, void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const result = await baseQuery("menu");
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
