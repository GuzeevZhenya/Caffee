import { baseApi } from "@/shared/api/baseApi";
import type { MenuResponse } from "@repo/shared";

/**
 * Загрузка 3D-меню и категорий (GET /api/menu).
 * Кэшируется под тегом Menu; меню редко меняется — без realtime.
 */
export const menuApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query<MenuResponse, void>({
      query: () => "menu",
      providesTags: ["Menu"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMenuQuery } = menuApi;
