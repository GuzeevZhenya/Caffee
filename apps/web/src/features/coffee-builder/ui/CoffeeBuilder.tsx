import { useAppDispatch, useAppSelector } from "@/app/store";
import { addItem, selectCartItems } from "@/features/cart";
import { formatPrice } from "@/shared/lib";
import { useRef, useState } from "react";
import {
  buildCustomCoffeeItem,
  calculateCustomCoffee,
  COFFEE_INGREDIENTS,
  CUSTOM_COFFEE_ITEM_ID,
  customCoffeeConfiguration,
  type CoffeeIngredient,
} from "../model/customCoffee";

export const REQUIRED_COFFEE_INGREDIENT_ID = "ing_espresso" as const;

/**
 * Конструктор «Собери свой кофе»: гость выбирает любое сочетание
 * ингредиентов, видит живой пересчёт цены и КБЖУ и добавляет свой
 * рецепт в корзину как отдельную позицию.
 */
export function CoffeeBuilder() {
  const dispatch = useAppDispatch();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    REQUIRED_COFFEE_INGREDIENT_ID,
    "ing_milk",
  ])
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected: CoffeeIngredient[] = COFFEE_INGREDIENTS.filter((i) => selectedIds.includes(i.id));
  const totals = calculateCustomCoffee(selected);


  const countInCart = useAppSelector((state) =>
    selectCartItems(state)
      .filter((line) => line.menuItemId === CUSTOM_COFFEE_ITEM_ID)
      .reduce((sum, line) => sum + line.quantity, 0),
  );

  const toggle = (id: string): void => {
    if (id === REQUIRED_COFFEE_INGREDIENT_ID) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAdd = (): void => {
    if (selected.length === 0) return;
    const item = buildCustomCoffeeItem(selected);
    dispatch(
      addItem({
        item,
        configuration: customCoffeeConfiguration(selected),
        unitPrice: totals.price,
      }),
    );
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <section className="wrap mt-20">
      <div className="card grid !transform-none gap-8 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:p-10">
        <div className="grid content-start gap-5">
          <div>
            <p className="eyebrow">Уникальная возможность</p>
            <h2 className="section-title">Собери свой кофе</h2>
            <p className="section-sub">
              Выберите любое сочетание из {COFFEE_INGREDIENTS.length} ингредиентов — цена и
              калорийность пересчитаются мгновенно.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Ингредиенты">
            {COFFEE_INGREDIENTS.map((ingredient) => {
              const isRequired = ingredient.id === REQUIRED_COFFEE_INGREDIENT_ID;
              const active = selectedIds.includes(ingredient.id);
              return (
                <button
                  key={ingredient.id}
                  type="button"
                  className="chip inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-80"
                  aria-pressed={active}
                  aria-disabled={isRequired}
                  disabled={isRequired}
                  title={isRequired ? "Обязательный ингредиент" : undefined}
                  onClick={() => toggle(ingredient.id)}
                >
                  <span
                    className="size-3 rounded-full border border-white/15"
                    style={{ background: ingredient.colorHex }}
                    aria-hidden="true"
                  />
                  {ingredient.title}
                  <span className={active ? "text-ink-900/70" : "text-cream-dim"}>
                    +{ingredient.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-4 rounded-m border border-ink-500 bg-ink-900/60 p-5">
          <h3 className="text-lg">Ваш рецепт</h3>
          {selected.length === 0 ? (
            <p className="text-sm text-cream-dim">
              Пока пусто — выберите хотя бы один ингредиент слева.
            </p>
          ) : (
            <ul className="grid gap-2">
              {selected.map((ingredient, index) => (
                <li
                  key={ingredient.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-m border border-ink-500 bg-ink-700 px-3 py-2"
                >
                  <span
                    className="size-[18px] rounded-md border border-white/15"
                    style={{ background: ingredient.colorHex }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold">
                    {index + 1}. {ingredient.title}
                    <span className="ml-2 text-xs font-normal text-cream-dim">
                      {ingredient.grams} г · {ingredient.kcal} ккал
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-gold">
                    +{formatPrice(ingredient.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [totals.price, "цена"],
              [totals.kcal, "ккал"],
              [totals.grams, "грамм"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-s border border-ink-500 px-1 py-2">
                <strong className="block font-display text-[15px]">
                  {label === "цена" ? formatPrice(Number(value)) : value}
                </strong>
                <span className="text-[11px] uppercase tracking-[0.08em] text-cream-dim">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={selected.length === 0}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added
              ? "Добавлено ✓"
              : countInCart > 0
                ? `В корзине · ${countInCart}`
                : `В корзину — ${formatPrice(totals.price)}`}
          </button>
        </aside>
      </div>
    </section>
  );
}
