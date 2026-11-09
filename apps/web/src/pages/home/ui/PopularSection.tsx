import { useGetMenuQuery } from "@/entities/menu-item";
import { drinkPhotoUrl, useReveal } from "@/shared/lib";
import { Link } from "react-router";
import { PopularCard } from "./PopularCard";

/**
 * Секция «Популярные напитки»: витрина лендинга.
 * Максимум 9 позиций с фото; если в меню больше — кнопка «Смотреть меню».
 */
export function PopularSection() {
  const { data, isLoading, isError } = useGetMenuQuery();
  const revealRef = useReveal<HTMLElement>();

  const photoItems = data ? data.items.filter((item) => drinkPhotoUrl(item) !== null) : [];
  const popularItems = photoItems.slice(0, 9);
  const hasMoreItems = photoItems.length > popularItems.length;

  return (
    <section ref={revealRef} className="wrap mt-20">
      <p className="eyebrow">Витрина</p>
      <h2 className="section-title">Популярные напитки</h2>
      {isLoading ? <p className="mt-6 text-cream-dim">Загружаю меню…</p> : null}
      {isError ? (
        <p className="mt-6 text-rose-warm">
          Не удалось загрузить меню. Проверьте, что запущен apps/api.
        </p>
      ) : null}
      {data ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularItems.map((item) => (
            <PopularCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
      {hasMoreItems ? (
        <div className="mt-8 flex justify-center">
          <Link to="/menu" className="btn btn-ghost">
            Смотреть меню
          </Link>
        </div>
      ) : null}
    </section>
  );
}
