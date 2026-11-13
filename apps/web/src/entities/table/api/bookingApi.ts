import { baseApi } from "@/shared/api/baseApi";
import { mockTablesForSlot } from "@/shared/lib";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import type {
  BookingRealtimeEvent,
  HoldTableInput,
  HoldTableResponse,
  TableSlotQuery,
  TableSlotStatus,
} from "@repo/shared";

/** ID кэш-тега конкретного слота: инвалидируем точечно, не трогая другие слоты */
function slotTagId(query: TableSlotQuery): string {
  return `${query.date}T${query.slot}`;
}

export interface ReleaseTableInput {
  tableId: string;
  /** Начало слота в ISO 8601 */
  slotStart: string;
}

/**
 * Столы и бронирование.
 * Realtime: пока активна подписка getTablesForSlot, onCacheEntryAdded слушает
 * канал Supabase "cafe-tables" (postgres_changes по Booking + broadcast локов
 * из Redis) и точечно инвалидирует тег слота — RTK Query делает refetch.
 */
export const bookingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTablesForSlot: build.query<TableSlotStatus[], TableSlotQuery>({
      async queryFn(params, _api, _extra, baseQuery) {
        const result = await baseQuery({ url: "tables", params });
        if (result.error || result.data === undefined) {
          return { data: mockTablesForSlot(params) };
        }
        return { data: result.data as TableSlotStatus[] };
      },
      providesTags: (_result, _error, arg) => [{ type: "Tables" as const, id: slotTagId(arg) }],
      async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
        const supabase = getSupabaseBrowser();
        if (!supabase) return; // dev без Supabase: realtime выключен

        await cacheDataLoaded;
        const tagId = slotTagId(arg);
        const refetchSlot = (): void => {
          dispatch(baseApi.util.invalidateTags([{ type: "Tables", id: tagId }]));
        };

        const channel = supabase
          .channel("cafe-tables")
          // Изменения броней в БД (подтверждение/отмена)
          .on("postgres_changes", { event: "*", schema: "public", table: "Booking" }, refetchSlot)
          // Broadcast от /api/tables/hold — мгновенный статус «Бронируется другим гостем»
          .on("broadcast", { event: "table-lock" }, ({ payload }) => {
            const event = payload as BookingRealtimeEvent | undefined;
            if (event?.payload.slotStart.startsWith(arg.date)) refetchSlot();
          })
          .subscribe();

        await cacheEntryRemoved;
        void supabase.removeChannel(channel);
      },
    }),

    /** Временный лок стола в Redis на 10 минут */
    holdTable: build.mutation<HoldTableResponse, HoldTableInput>({
      query: (body) => ({ url: "tables/hold", method: "POST", body }),
      invalidatesTags: ["Tables"],
    }),

    /** Досрочное снятие своего лока (отмена выбора стола) */
    releaseTable: build.mutation<{ released: boolean }, ReleaseTableInput>({
      query: (body) => ({ url: "tables/hold", method: "DELETE", body }),
      invalidatesTags: ["Tables"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetTablesForSlotQuery, useHoldTableMutation, useReleaseTableMutation } =
  bookingApi;
