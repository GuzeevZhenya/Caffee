import { useAppSelector } from "@/app/store";
import { useStaffShiftActionMutation, useStaffShiftsQuery } from "@/features/staff-board";
import { selectStaffUser } from "@/features/staff-auth";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function todayInputValue(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/** Смена бариста и список смен админа. Журнал живёт в процессе API. */
export function StaffShiftsPage({ title }: { title: string }) {
  const today = todayInputValue();
  const user = useAppSelector(selectStaffUser);
  const { data, isLoading, isError, error } = useStaffShiftsQuery(today);
  const [act, state] = useStaffShiftActionMutation();
  const mineOpen = data?.shifts.some((shift) => shift.userId === user?.id && !shift.closedAt) ?? false;

  return (
    <StaffSection eyebrow="Кабинет" title={title}>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={state.isLoading || mineOpen}
          onClick={() => void act({ action: "open" })}
        >
          Открыть смену
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={state.isLoading || !mineOpen}
          onClick={() => void act({ action: "close" })}
        >
          Закрыть смену
        </button>
      </div>
      {isLoading ? <p className="text-cream-dim">Загружаю смены…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {state.isError ? <p className="text-sm text-rose-warm">{staffBoardError(state.error)}</p> : null}
      {data ? (
        <ul className="grid gap-3">
          {data.shifts.length === 0 ? <li className="text-sm text-cream-dim">Сегодня смен нет.</li> : null}
          {data.shifts.map((shift) => (
            <li key={shift.id} className="rounded-l border border-ink-500 px-4 py-3 text-sm">
              <p className="font-medium text-cream">
                {shift.userName} · {shift.role === "ADMIN" ? "Админ" : "Бариста"}
              </p>
              <p className="text-cream-dim">
                {clock(shift.openedAt)}
                {shift.closedAt ? ` – ${clock(shift.closedAt)}` : " · открыта"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </StaffSection>
  );
}
