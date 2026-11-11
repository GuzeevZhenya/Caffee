import { usePatchStaffStockMutation, useStaffStockQuery } from "@/features/staff-board";
import type { StaffStockItem } from "@repo/shared";
import { useState, type FormEvent } from "react";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function StockRow({ item }: { item: StaffStockItem }) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [save, state] = usePatchStaffStockMutation();

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const next = Number(quantity);
    if (!Number.isInteger(next) || next < 0) return;
    void save({ id: item.id, quantity: next });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border-b border-ink-500 py-4">
      <label className="field min-w-40 flex-1">
        <span className="field-label">
          {item.name}
          {item.quantity <= item.lowAt ? " · мало" : ""}
        </span>
        <input
          className="field-input"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          aria-label={`Остаток, ${item.name}`}
        />
      </label>
      <button type="submit" className="btn btn-ghost" disabled={state.isLoading}>
        Сохранить
      </button>
      {state.isError ? <p className="w-full text-sm text-rose-warm">{staffBoardError(state.error)}</p> : null}
    </form>
  );
}

/** `/staff/stock` — остатки выпечки */
export function StaffStockPage() {
  const { data, isLoading, isError, error } = useStaffStockQuery();

  return (
    <StaffSection eyebrow="Кабинет" title="Склад">
      {isLoading ? <p className="text-cream-dim">Загружаю остатки…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data ? (
        <div>
          {data.items.map((item) => (
            <StockRow key={`${item.id}-${item.quantity}`} item={item} />
          ))}
        </div>
      ) : null}
    </StaffSection>
  );
}
