import { useGetTablesForSlotQuery } from "@/entities/table";
import { safeLoadErrorMessage } from "@/shared/lib";
import { HallMap } from "@/widgets/hall-map";
import { useState } from "react";

function todayIso(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Бронирование: дата/слот + 2D-карта зала (Фаза 4). */
export function BookingPage() {
  const [date, setDate] = useState(todayIso());
  const [slot, setSlot] = useState("18:00");

  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(slot);
  const {
    data: tables,
    isLoading,
    isError,
  } = useGetTablesForSlotQuery({ date, slot }, { skip: !isValid });

  return (
    <div className="wrap flex flex-col gap-5 pb-12 pt-10 sm:gap-6 sm:pb-16 sm:pt-16">
      <div>
        <p className="eyebrow">Зал</p>
        <h1 className="section-title">Бронирование столика</h1>
        <p className="section-sub">
          Выберите дату и время, затем столик на плане зала. Свободный стол можно удержать на 10
          минут — бронь попадёт в корзину для заказа «в кафе».
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="field">
          <span className="field-label">Дата</span>
          <input
            type="date"
            value={date}
            min={todayIso()}
            onChange={(event) => setDate(event.target.value)}
            className="field-input"
          />
        </label>
        <label className="field">
          <span className="field-label">Время</span>
          <input
            type="time"
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
            className="field-input"
          />
        </label>
      </div>

      {isLoading ? <p className="text-cream-dim">Проверяю столики…</p> : null}
      {isError ? <p className="text-cream-dim">{safeLoadErrorMessage()}</p> : null}

      {tables ? <HallMap tables={tables} date={date} slot={slot} /> : null}
    </div>
  );
}
