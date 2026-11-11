import { useStaffRevenueQuery } from "@/features/staff-board";
import { formatPrice } from "@/shared/lib";
import { useState } from "react";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function todayInputValue(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `/staff/revenue` — суммы заказов за выбранный день */
export function StaffRevenuePage() {
  const [date, setDate] = useState(todayInputValue);
  const { data, isLoading, isError, error } = useStaffRevenueQuery(date);

  return (
    <StaffSection eyebrow="Кабинет · админ" title="Выручка">
      <label className="field max-w-xs">
        <span className="field-label">День</span>
        <input
          type="date"
          className="field-input"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      {isLoading ? <p className="text-cream-dim">Считаю…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data ? (
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-l border border-ink-500 px-4 py-4">
            <dt className="text-sm text-cream-dim">Заказы</dt>
            <dd className="mt-1 font-display text-3xl text-cream">{data.ordersCount}</dd>
          </div>
          <div className="rounded-l border border-ink-500 px-4 py-4">
            <dt className="text-sm text-cream-dim">Оплачено</dt>
            <dd className="mt-1 font-display text-3xl text-cream">{formatPrice(data.paidTotal)}</dd>
          </div>
          <div className="rounded-l border border-ink-500 px-4 py-4">
            <dt className="text-sm text-cream-dim">Ждёт оплаты</dt>
            <dd className="mt-1 font-display text-3xl text-cream">{formatPrice(data.unpaidTotal)}</dd>
          </div>
        </dl>
      ) : null}
      {data && data.cancelledCount > 0 ? (
        <p className="text-sm text-cream-dim">Отменено за день: {data.cancelledCount}.</p>
      ) : null}
    </StaffSection>
  );
}
