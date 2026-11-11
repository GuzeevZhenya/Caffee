import { MenuItemCard, useGetMenuQuery } from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { safeLoadErrorMessage } from "@/shared/lib";
import { useState } from "react";
import { Link } from "react-router";

/** Витрина меню (дизайн mockup/menu.html): фильтры-чипы + карточки блюд */
export function MenuPage() {
  const { data, isLoading, isError } = useGetMenuQuery();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [{ id: "all", name: "Всё" }, ...(data?.categories ?? [])];

  return (
    <div className="wrap pb-12 sm:pb-16">
      <div className="pb-5 pt-10 sm:pb-6 sm:pt-16">
        <p className="eyebrow">Меню</p>
        <h1 className="section-title">Выберите блюдо — и разберите его</h1>
        <p className="section-sub">
          Каждая карточка ведёт на страницу блюда, где состав раскладывается по слоям с граммовкой
          и КБЖУ.
        </p>
        {import.meta.env.DEV && data?.source === "mock" ? (
          <p className="mt-4 rounded-m border border-gold-deep bg-ink-700 px-4 py-2 text-sm text-gold">
            Демо-режим: показаны моковые данные.
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Фильтр по категориям">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="chip"
              aria-pressed={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-cream-dim">Загружаю меню…</p> : null}
      {isError || (!isLoading && !data) ? (
        <p className="text-cream-dim">{safeLoadErrorMessage()}</p>
      ) : null}

      {data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {data.items
            .filter((item) => activeCategory === "all" || item.categoryId === activeCategory)
            .map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                categoryName={
                  data.categories.find((c) => c.id === item.categoryId)?.name ?? undefined
                }
                action={
                  <>
                    <AddToCartButton item={item} />
                    <Link
                      to={`/menu/${item.id}`}
                      className="btn btn-ghost !min-h-0 !px-4 !py-2 text-sm"
                    >
                      Состав
                    </Link>
                  </>
                }
              />
            ))}
        </div>
      ) : null}
    </div>
  );
}
