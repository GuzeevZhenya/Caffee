/** Длина брони по умолчанию: выбор на 16:00 занимает стол до 18:00. */
export const BOOKING_SLOT_MINUTES = 120;

/** За сколько минут до слота бот спрашивает «Готовить сейчас». */
export const BOOKING_REMINDER_MINUTES = 15;

/** Зал принимает гостей с 10:00, последний слот заканчивается в 23:00. */
export const CAFE_OPEN_MINUTES = 10 * 60;
export const CAFE_CLOSE_MINUTES = 23 * 60;

export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseMinutes(hhmm: string): number {
  const [hoursRaw, minutesRaw] = hhmm.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

/** Часовые старты, в которые помещается полная бронь до закрытия. */
export function listBookingSlots(): string[] {
  const slots: string[] = [];
  for (
    let start = CAFE_OPEN_MINUTES;
    start + BOOKING_SLOT_MINUTES <= CAFE_CLOSE_MINUTES;
    start += 60
  ) {
    slots.push(formatMinutes(start));
  }
  return slots;
}

export function slotEndLabel(slot: string): string {
  return formatMinutes(parseMinutes(slot) + BOOKING_SLOT_MINUTES);
}

/** Пересечение полуинтервалов [start, end). Конец слота стол уже свободен. */
export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function isBookingSlotPast(dateIso: string, slot: string, now: Date = new Date()): boolean {
  return new Date(`${dateIso}T${slot}:00`).getTime() <= now.getTime();
}
