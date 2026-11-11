import { baseApi } from "@/shared/api/baseApi";
import { mockMenuResponse } from "@/shared/lib";
import type { MenuResponse } from "@repo/shared";

/**
 * Загрузка 3D-меню и категорий (GET /api/menu).
 * При сетевой/серверной ошибке отдаём моки из @repo/shared — UI не остаётся пустым.
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
