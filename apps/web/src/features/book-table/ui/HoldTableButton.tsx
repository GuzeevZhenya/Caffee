import { useAppDispatch } from "@/app/store";
import { useHoldTableMutation, useReleaseTableMutation } from "@/entities/table";
import { attachBooking, detachBooking } from "@/features/cart";
import type { TableSlotStatus } from "@repo/shared";

/** Длительность слота брони по умолчанию (мин) — синхронизирована с apps/api */
const SLOT_DURATION_MINUTES = 90;

interface HoldTableButtonProps {
  table: TableSlotStatus;
  /** Дата слота YYYY-MM-DD */
  date: string;
  /** Время слота HH:mm */
  slot: string;
}

/**
 * Кнопка бронирования столика: FREE → холд в Redis (10 мин),
 * свой холд → досрочное снятие. Успешный холд привязывается к корзине.
 */
export function HoldTableButton({ table, date, slot }: HoldTableButtonProps) {
  const dispatch = useAppDispatch();
  const [holdTable, { isLoading: isHolding }] = useHoldTableMutation();
  const [releaseTable, { isLoading: isReleasing }] = useReleaseTableMutation();

  const baseClass = "rounded-full px-4 py-2 text-sm font-semibold transition";

  if (table.status === "BOOKED") {
    return (
      <button
        type="button"
        disabled
        className={`${baseClass} cursor-not-allowed bg-ink-600 text-cream-dim opacity-60`}
      >
        Занят
      </button>
    );
  }

  if (table.status === "HELD" && !table.heldByMe) {
    return (
      <button type="button" disabled className={`${baseClass} bg-gold/10 text-gold opacity-80`}>
        Бронируется другим гостем
      </button>
    );
  }

  if (table.heldByMe) {
    const handleRelease = async (): Promise<void> => {
      const slotStart = new Date(`${date}T${slot}:00`);
      try {
        await releaseTable({ tableId: table.id, slotStart: slotStart.toISOString() }).unwrap();
        dispatch(detachBooking());
      } catch {
        // Лок уже истёк или снят — статусы обновятся refetch'ем
      }
    };
    return (
      <button
        type="button"
        onClick={() => void handleRelease()}
        disabled={isReleasing}
        className={`${baseClass} bg-gold text-ink-900 hover:bg-cream disabled:opacity-50`}
      >
        {isReleasing ? "Снимаю…" : "Отменить бронь"}
      </button>
    );
  }

  const handleHold = async (): Promise<void> => {
    const startTime = new Date(`${date}T${slot}:00`);
    const endTime = new Date(startTime.getTime() + SLOT_DURATION_MINUTES * 60_000);
    try {
      const result = await holdTable({
        tableId: table.id,
        startTime,
        endTime,
        guestsCount: 2,
      }).unwrap();
      if (result.locked) {
        dispatch(
          attachBooking({
            tableId: table.id,
            tableTitle: table.title,
            slotStart: startTime.toISOString(),
            slotEnd: endTime.toISOString(),
            heldUntil: result.heldUntil,
            bookingId: result.bookingId,
          }),
        );
      }
    } catch {
      // 409: стол перехватил другой гость — статусы обновятся refetch'ем
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleHold()}
      disabled={isHolding}
      className={`${baseClass} bg-gold text-ink-900 hover:bg-cream disabled:opacity-50`}
    >
      {isHolding ? "Бронирую…" : "Забронировать"}
    </button>
  );
}
