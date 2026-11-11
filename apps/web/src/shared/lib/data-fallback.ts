import {
  isMockTableBooked,
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_TABLES,
  type MenuResponse,
  type TableSlotQuery,
  type TableSlotStatus,
} from "@repo/shared";

/** Клиентский фолбэк меню, если /api/menu недоступен. */
export function mockMenuResponse(): MenuResponse {
  return {
    categories: MOCK_CATEGORIES,
    items: MOCK_MENU_ITEMS,
    source: "mock",
  };
}

/**
 * Клиентский фолбэк статусов столов, если /api/tables недоступен.
 * Занятость — из мок-расписания на 2 часа. Фильтры совпадают с API.
 */
export function mockTablesForSlot(query: TableSlotQuery): TableSlotStatus[] {
  return MOCK_TABLES.filter((table) => table.isActive)
    .filter((table) => (query.guestsCount ? table.seats >= query.guestsCount : true))
    .filter((table) => (query.hasPowerOutlet ? table.hasPowerOutlet : true))
    .map((table) => ({
      ...table,
      status: isMockTableBooked(table.number, query.slot) ? ("BOOKED" as const) : ("FREE" as const),
      heldUntil: null,
      heldByMe: false,
    }));
}
