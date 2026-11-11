import { useGetTablesForSlotQuery } from "@/entities/table";
import { safeLoadErrorMessage } from "@/shared/lib";
import { HallMap } from "@/widgets/hall-map";
import {
  bookingGuestSchema,
  isBookingSlotPast,
  listBookingSlots,
  slotEndLabel,
  type TableSlotStatus,
} from "@repo/shared";
import { useMemo, useState } from "react";

function todayIso(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function firstOpenSlot(date: string): string {
  const slots = listBookingSlots();
  const open = slots.find((slot) => !isBookingSlotPast(date, slot));
  return open ?? slots[0] ?? "10:00";
}

/** Бронирование: имя, телефон, слот на 2 часа и план зала. */
export function BookingPage() {
  const [date, setDate] = useState(todayIso());
  const [slot, setSlot] = useState(() => firstOpenSlot(todayIso()));
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [localBooked, setLocalBooked] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const slots = listBookingSlots();
  const slotEnd = slotEndLabel(slot);
  const guestCheck = bookingGuestSchema.safeParse({ guestName, guestPhone });
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date) && slots.includes(slot);

  const {
    data: tables,
    isLoading,
    isError,
    error,
  } = useGetTablesForSlotQuery({ date, slot }, { skip: !isValid });

  const visibleTables = useMemo<TableSlotStatus[] | undefined>(() => {
    if (!tables) return undefined;
    return tables.map((table) =>
      localBooked[`${date}T${slot}:${table.id}`]
        ? { ...table, status: "BOOKED" }
        : table,
    );
  }, [tables, localBooked, date, slot]);

  const freeCount = visibleTables?.filter((table) => table.status === "FREE").length ?? 0;
  const busyCount = visibleTables?.filter((table) => table.status !== "FREE").length ?? 0;

  const handleDate = (value: string): void => {
    setDate(value);
    setNotice(null);
    if (isBookingSlotPast(value, slot)) {
      setSlot(firstOpenSlot(value));
    }
  };

  return (
    <div className="wrap flex flex-col gap-5 pb-12 pt-10 sm:gap-6 sm:pb-16 sm:pt-16">
      <div>
        <p className="eyebrow">Зал</p>
        <h1 className="section-title">Бронирование столика</h1>
        <p className="section-sub">
          Укажите имя, телефон и время. Бронь длится 2 часа: слот {slot} занимает стол до {slotEnd}.
          На плане видно, какие места свободны.
        </p>
      </div>

      <form
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="field">
          <span className="field-label">Имя</span>
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            className="field-input"
            autoComplete="name"
            placeholder="Анна"
          />
        </label>
        <label className="field">
          <span className="field-label">Телефон</span>
          <input
            value={guestPhone}
            onChange={(event) => setGuestPhone(event.target.value)}
            className="field-input"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+375 29 000-00-00"
          />
        </label>
        <label className="field">
          <span className="field-label">Дата</span>
          <input
            type="date"
            value={date}
            min={todayIso()}
            onChange={(event) => handleDate(event.target.value)}
            className="field-input"
          />
        </label>
        <label className="field">
          <span className="field-label">Время</span>
          <select
            value={slot}
            onChange={(event) => {
              setSlot(event.target.value);
              setNotice(null);
            }}
            className="field-input"
          >
            {slots.map((item) => (
              <option key={item} value={item} disabled={isBookingSlotPast(date, item)}>
                {item}–{slotEndLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </form>

      {(guestName.length > 0 || guestPhone.length > 0) && !guestCheck.success ? (
        <p className="text-sm text-cream-dim">
          {guestCheck.error.issues[0]?.message ?? "Заполните имя и телефон."}
        </p>
      ) : null}

      {visibleTables ? (
        <p className="text-sm text-cream-dim">
          На {slot}–{slotEnd}: свободно {freeCount}, занято {busyCount}.
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-m border border-gold-deep bg-ink-700 px-4 py-3 text-sm text-gold">
          {notice}
        </p>
      ) : null}

      {isLoading ? <p className="text-cream-dim">Проверяю столики…</p> : null}
      {isError ? <p className="text-cream-dim">{safeLoadErrorMessage(error)}</p> : null}

      {visibleTables ? (
        <HallMap
          tables={visibleTables}
          date={date}
          slot={slot}
          slotEnd={slotEnd}
          guestName={guestName}
          guestPhone={guestPhone}
          canBook={guestCheck.success}
          onBooked={() => {
            setNotice(
              `${guestName.trim()}, стол удерживается с ${slot} до ${slotEnd}. Телефон ${guestPhone.trim()}.`,
            );
          }}
          onMockBooked={(tableId) => {
            setLocalBooked((current) => ({
              ...current,
              [`${date}T${slot}:${tableId}`]: guestName.trim(),
            }));
            setNotice(
              `${guestName.trim()}, стол отмечен занятым с ${slot} до ${slotEnd}. Это мок: база сейчас недоступна, телефон ${guestPhone.trim()} сохранён только на этом экране.`,
            );
          }}
        />
      ) : null}
    </div>
  );
}
