import { MenuItemCard, useGetMenuQuery } from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { safeLoadErrorMessage } from "@/shared/lib";
import { useState } from "react";
import { Link } from "react-router";

/** Витрина Mini App: те же блюда, что на сайте. */
export function TmaMenuPage() {
  const { data, isLoading, isError, error } = useGetMenuQuery();
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = [{ id: "all", name: "Всё" }, ...(data?.categories ?? [])];

  return (
    <div className="wrap pb-6 pt-3">
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Категории">
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

      {isLoading ? <p className="text-cream-dim">Загружаю меню…</p> : null}
      {isError || (!isLoading && !data) ? (
        <p className="text-cream-dim">{safeLoadErrorMessage(error)}</p>
      ) : null}

      {data ? (
        <div className="grid grid-cols-1 gap-4">
          {data.items
            .filter((item) => activeCategory === "all" || item.categoryId === activeCategory)
            .map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                to={`/tma/item/${item.id}`}
                categoryName={
                  data.categories.find((category) => category.id === item.categoryId)?.name
                }
                action={
                  <>
                    <AddToCartButton item={item} />
                    <Link
                      to={`/tma/item/${item.id}`}
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
