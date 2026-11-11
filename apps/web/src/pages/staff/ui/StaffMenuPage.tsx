import { usePatchStaffMenuMutation, useStaffMenuQuery } from "@/features/staff-board";
import { formatPrice } from "@/shared/lib";
import type { StaffMenuRow } from "@repo/shared";
import { useState, type FormEvent } from "react";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function MenuEditRow({ item }: { item: StaffMenuRow }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.basePrice));
  const [available, setAvailable] = useState(item.isAvailable);
  const [save, state] = usePatchStaffMenuMutation();

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const basePrice = Number(price.replace(",", "."));
    if (!Number.isFinite(basePrice) || basePrice <= 0) return;
    void save({ id: item.id, name: name.trim(), basePrice, isAvailable: available });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 border-t border-ink-500 px-4 py-4 sm:grid-cols-[1.4fr_0.8fr_8rem_auto] sm:items-end">
      <label className="field">
        <span className="field-label">Название</span>
        <input className="field-input" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="field">
        <span className="field-label">{item.categoryName}</span>
        <input
          className="field-input"
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          aria-label={`Цена, ${item.name}`}
          required
        />
      </label>
      <label className="flex items-center gap-2 pb-3 text-sm">
        <input
          type="checkbox"
          checked={available}
          onChange={(event) => setAvailable(event.target.checked)}
        />
        В меню
      </label>
      <button type="submit" className="btn btn-ghost" disabled={state.isLoading}>
        {state.isLoading ? "Сохраняю…" : "Сохранить"}
      </button>
      {state.isError ? <p className="text-sm text-rose-warm sm:col-span-4">{staffBoardError(state.error)}</p> : null}
      {state.isSuccess ? (
        <p className="text-sm text-cream-dim sm:col-span-4">Сохранено. Гость видит {formatPrice(item.basePrice)}.</p>
      ) : null}
    </form>
  );
}

/** `/staff/menu` — название, цена и наличие */
export function StaffMenuPage() {
  const { data, isLoading, isError, error } = useStaffMenuQuery();

  return (
    <StaffSection eyebrow="Кабинет · админ" title="Меню">
      {isLoading ? <p className="text-cream-dim">Загружаю меню…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data ? (
        <div className="overflow-hidden rounded-l border border-ink-500">
          {data.items.map((item) => (
            <MenuEditRow key={`${item.id}-${item.name}-${item.basePrice}-${item.isAvailable}`} item={item} />
          ))}
        </div>
      ) : null}
    </StaffSection>
  );
}
