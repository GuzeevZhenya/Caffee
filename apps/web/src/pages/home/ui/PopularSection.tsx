import { useGetMenuQuery } from "@/entities/menu-item";
import { drinkPhotoUrl, safeLoadErrorMessage, useReveal } from "@/shared/lib";
import { Link } from "react-router";
import { PopularCard } from "./PopularCard";

/**
 * Signature / Popular Picks: 4 карточки (чётное), на mobile — 2 колонки.
 */
export function PopularSection() {
  const { data, isLoading, isError } = useGetMenuQuery();
  const revealRef = useReveal<HTMLElement>();

  const photoItems = data ? data.items.filter((item) => drinkPhotoUrl(item) !== null) : [];
  const popularItems = photoItems.slice(0, 4);
  const showLoader = isLoading && !data;

  return (
    <section ref={revealRef} className="wrap mt-16 sm:mt-24">
      <div className="text-center">
        <p className="eyebrow eyebrow-center justify-center">Our Signature</p>
        <h2 className="section-title">Популярные напитки</h2>
        <p className="section-sub mx-auto">
          Четыре позиции, с которых чаще всего начинают вечер в Tactile.
        </p>
      </div>
      {showLoader ? <p className="mt-8 text-center text-cream-dim">Загружаю меню…</p> : null}
      {isError && !data ? (
        <p className="mt-8 text-center text-cream-dim">{safeLoadErrorMessage()}</p>
      ) : null}
      {popularItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-4">
          {popularItems.map((item) => (
            <PopularCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
      <div className="mt-8 flex justify-center sm:mt-10">
        <Link to="/menu" className="btn btn-ghost">
          Смотреть всё меню
        </Link>
      </div>
    </section>
  );
}
