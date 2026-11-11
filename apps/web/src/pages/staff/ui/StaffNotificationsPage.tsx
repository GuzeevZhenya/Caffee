import { useStaffNotificationsQuery } from "@/features/staff-board";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

/** `/staff/notifications` — смена, готовые заказы, низкий остаток */
export function StaffNotificationsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useStaffNotificationsQuery();

  return (
    <StaffSection eyebrow="Кабинет" title="Уведомления">
      <button type="button" className="btn btn-ghost w-fit" onClick={() => void refetch()} disabled={isFetching}>
        {isFetching ? "Обновляю…" : "Обновить"}
      </button>
      {isLoading ? <p className="text-cream-dim">Загружаю…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data && data.items.length === 0 ? <p className="text-sm text-cream-dim">Сейчас всё спокойно.</p> : null}
      {data ? (
        <ul className="grid gap-3">
          {data.items.map((item) => (
            <li
              key={item.id}
              className={`rounded-l border px-4 py-3 text-sm ${
                item.tone === "warn" ? "border-rose-warm/60 text-cream" : "border-ink-500 text-cream-dim"
              }`}
            >
              {item.text}
            </li>
          ))}
        </ul>
      ) : null}
    </StaffSection>
  );
}
