import { useGetMenuQuery } from "@/entities/menu-item";
import { safeLoadErrorMessage } from "@/shared/lib";
import { MenuItemViewer } from "@/widgets/menu-item-viewer";
import { Link, useParams } from "react-router";

/** Карточка блюда внутри Mini App. */
export function TmaItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { data, isLoading, isError, error } = useGetMenuQuery();

  if (isLoading) {
    return (
      <div className="wrap py-8">
        <p className="text-cream-dim">Загружаю блюдо…</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="wrap py-8">
        <p className="text-cream-dim">{safeLoadErrorMessage(error)}</p>
      </div>
    );
  }

  const item = data.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    return (
      <div className="wrap flex flex-col gap-3 py-8">
        <p className="text-cream-dim">Блюдо не найдено.</p>
        <Link to="/tma" className="text-sm text-cream-dim underline underline-offset-2">
          ← К меню
        </Link>
      </div>
    );
  }

  const categoryName = data.categories.find((candidate) => candidate.id === item.categoryId)?.name ?? "";

  return (
    <div className="wrap flex flex-col gap-4 py-4">
      <p className="text-[13px] text-cream-dim">
        <Link to="/tma" className="text-cream-dim hover:text-gold">
          Меню
        </Link>{" "}
        / {categoryName} / {item.name}
      </p>
      <MenuItemViewer item={item} />
    </div>
  );
}
