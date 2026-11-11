import {
  BOOKING_SLOT_MINUTES,
  parseMinutes,
  rangesOverlap,
} from "../utils/booking-slots";

/** Занятое окно мок-зала. Конец не включён: 16:00–18:00 свободно в 18:00. */
export interface MockTableWindow {
  tableNumber: number;
  start: string;
  end: string;
}

/**
 * Одинаковое расписание на любую дату, пока нет живых броней в БД.
 * Стол 1 занят 16:00–18:00 и свободен на слоте 18:00.
 */
export const MOCK_TABLE_WINDOWS: MockTableWindow[] = [
  { tableNumber: 1, start: "12:00", end: "14:00" },
  { tableNumber: 1, start: "16:00", end: "18:00" },
  { tableNumber: 2, start: "18:00", end: "20:00" },
  { tableNumber: 4, start: "10:00", end: "12:00" },
  { tableNumber: 6, start: "14:00", end: "16:00" },
  { tableNumber: 8, start: "16:00", end: "18:00" },
  { tableNumber: 10, start: "20:00", end: "22:00" },
];

export function isMockTableBooked(
  tableNumber: number,
  slot: string,
  durationMinutes: number = BOOKING_SLOT_MINUTES,
): boolean {
  const start = parseMinutes(slot);
  const end = start + durationMinutes;
  return MOCK_TABLE_WINDOWS.some((window) => {
    if (window.tableNumber !== tableNumber) return false;
    return rangesOverlap(start, end, parseMinutes(window.start), parseMinutes(window.end));
  });
}
