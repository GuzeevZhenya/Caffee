import {
  useCreateStaffMenuMutation,
  usePatchStaffMenuMutation,
  useStaffMenuQuery,
  useUploadStaffMenuPhotoMutation,
} from "@/features/staff-board";
import { formatPrice } from "@/shared/lib";
import type { StaffMenuCategory, StaffMenuRow } from "@repo/shared";
import { useState, type FormEvent } from "react";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function MenuEditRow({ item }: { item: StaffMenuRow }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.basePrice));
  const [available, setAvailable] = useState(item.isAvailable);
  const [save, state] = usePatchStaffMenuMutation();
  const [uploadPhoto, photoState] = useUploadStaffMenuPhotoMutation();

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const basePrice = Number(price.replace(",", "."));
    if (!Number.isFinite(basePrice) || basePrice <= 0) return;
    void save({ id: item.id, name: name.trim(), basePrice, isAvailable: available });
  };

  const handlePhoto = (file: File | undefined): void => {
    if (!file) return;
    void uploadPhoto({ id: item.id, file });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 border-t border-ink-500 px-4 py-4 sm:grid-cols-[5.5rem_1.4fr_0.8fr_8rem_auto] sm:items-end"
    >
      <label className="flex cursor-pointer flex-col gap-2">
        <span className="field-label">Фото</span>
        <span className="relative block h-16 w-16 overflow-hidden rounded-m border border-ink-500 bg-ink">
          {item.previewImageUrl ? (
            <img src={item.previewImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-cream-dim">нет</span>
          )}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            handlePhoto(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
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
      <button type="submit" className="btn btn-ghost" disabled={state.isLoading || photoState.isLoading}>
        {state.isLoading ? "Сохраняю…" : photoState.isLoading ? "Фото…" : "Сохранить"}
      </button>
      {state.isError ? <p className="text-sm text-rose-warm sm:col-span-5">{staffBoardError(state.error)}</p> : null}
      {photoState.isError ? (
        <p className="text-sm text-rose-warm sm:col-span-5">{staffBoardError(photoState.error)}</p>
      ) : null}
      {state.isSuccess ? (
        <p className="text-sm text-cream-dim sm:col-span-5">Сохранено. Гость видит {formatPrice(item.basePrice)}.</p>
      ) : null}
    </form>
  );
}

function CreateMenuForm({ categories }: { categories: StaffMenuCategory[] }) {
  const [createItem, state] = useCreateStaffMenuMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("");

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const basePrice = Number(price.replace(",", "."));
    if (!Number.isFinite(basePrice) || basePrice <= 0 || !categoryId) return;
    try {
      await createItem({
        name: name.trim(),
        description: description.trim(),
        categoryId,
        basePrice,
        isAvailable: true,
      }).unwrap();
      setName("");
      setDescription("");
      setPrice("");
    } catch {
      // текст ошибки берётся из mutation state
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="grid max-w-xl gap-4">
      <h2 className="font-display text-2xl text-cream">Новая позиция</h2>
      <label className="field">
        <span className="field-label">Название</span>
        <input className="field-input" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="field">
        <span className="field-label">Описание</span>
        <textarea
          className="field-input min-h-20"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={400}
        />
      </label>
      <label className="field">
        <span className="field-label">Категория</span>
        <select
          className="field-input"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Цена</span>
        <input
          className="field-input"
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn btn-gold w-fit" disabled={state.isLoading || categories.length === 0}>
        {state.isLoading ? "Добавляю…" : "Добавить в меню"}
      </button>
      {state.isError ? <p className="text-sm text-rose-warm">{staffBoardError(state.error)}</p> : null}
    </form>
  );
}

/** `/staff/menu` — название, цена, наличие, фото и новая позиция */
export function StaffMenuPage() {
  const { data, isLoading, isError, error } = useStaffMenuQuery();

  return (
    <StaffSection eyebrow="Кабинет · админ" title="Меню">
      {isLoading ? <p className="text-cream-dim">Загружаю меню…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data ? (
        <>
          <CreateMenuForm categories={data.categories} />
          <div className="overflow-hidden rounded-l border border-ink-500">
            {data.items.map((item) => (
              <MenuEditRow
                key={`${item.id}-${item.name}-${item.basePrice}-${item.isAvailable}-${item.previewImageUrl}`}
                item={item}
              />
            ))}
          </div>
        </>
      ) : null}
    </StaffSection>
  );
}
