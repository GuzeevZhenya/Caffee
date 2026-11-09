import { TableStatusBadge, useGetTablesForSlotQuery } from "@/entities/table";
import { HoldTableButton } from "@/features/book-table";
import { useState } from "react";

function todayIso(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Бронирование столиков: выбор даты/слота и статусы зала.
 * 3D-диорама зала заменит список в Фазе 4 — API и хуки те же.
 */
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
    <div className="wrap flex flex-col gap-6 pb-16 pt-16">
      <div>
        <p className="eyebrow">Зал</p>
        <h1 className="section-title">Бронирование столика</h1>
        <p className="section-sub">
          Выберите дату и время — свободные столы можно удержать на 10 минут (Redis-холд, как в
          боевом сценарии).
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
      {isError ? (
        <p className="text-rose-warm">
          Не удалось получить статусы. Проверьте, что запущен apps/api.
        </p>
      ) : null}

      {tables ? (
        <ul className="flex flex-col gap-3">
          {tables.map((table) => (
            <li
              key={table.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-500 bg-ink-700 p-4"
            >
              <div>
                <p className="font-medium">{table.title}</p>
                <p className="text-xs text-cream-dim">
                  {table.seats} мест · {table.zone}
                  {table.hasPowerOutlet ? " · есть розетка" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TableStatusBadge status={table.status} />
                <HoldTableButton table={table} date={date} slot={slot} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
