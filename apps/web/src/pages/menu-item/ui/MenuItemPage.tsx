import { useGetMenuQuery } from "@/entities/menu-item";
import { MenuItemViewer } from "@/widgets/menu-item-viewer";
import { Link, useParams } from "react-router";

/** Страница блюда: /menu/:itemId — фото + указатели слоёв сбоку */
export function MenuItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { data, isLoading, isError } = useGetMenuQuery();

  if (isLoading) {
    return (
      <div className="wrap py-16">
        <p className="text-cream-dim">Загружаю блюдо…</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="wrap py-16">
        <p className="text-rose-warm">
          Не удалось загрузить меню. Проверьте, что запущен apps/api (pnpm dev в корне поднимает
          оба).
        </p>
      </div>
    );
  }

  const item = data.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    return (
      <div className="wrap flex flex-col gap-3 py-16">
        <p className="text-rose-warm">Блюдо не найдено.</p>
        <Link to="/menu" className="text-sm text-cream-dim underline underline-offset-2">
          ← Назад к меню
        </Link>
      </div>
    );
  }

  const category = data.categories.find((candidate) => candidate.id === item.categoryId);
  const categoryName = category?.name ?? "";

  return (
    <div className="wrap flex flex-col gap-4 py-8">
      <p className="text-[13px] text-cream-dim">
        <Link to="/menu" className="text-cream-dim hover:text-gold">
          Меню
        </Link>{" "}
        / {categoryName} / {item.name}
      </p>
      <MenuItemViewer item={item} />
    </div>
  );
}
