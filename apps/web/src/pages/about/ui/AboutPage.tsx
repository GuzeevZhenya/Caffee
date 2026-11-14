import { ContentPage } from "@/shared/ui";
import { Link } from "react-router";

const HOURS = [
  ["Пн–Чт", "08:00–23:00"],
  ["Пт–Сб", "08:00–00:00"],
  ["Воскресенье", "09:00–22:00"],
] as const;

const HALL = [
  ["Окно", "Столы 1–4, панорама на улицу, розетки у каждого места."],
  ["Центр", "Столы 5–10, шум зала, удобно для компании."],
  ["Тихая", "Столы 11–14, дальше от барной стойки."],
  ["Терраса", "Сезонно, пока тепло. Стол бронируется так же, как в зале."],
] as const;

/** `/about` — кофейня, зал, часы и как у нас заказывают. */
export function AboutPage() {
  return (
    <ContentPage
      eyebrow="Tactile"
      title="О кофейне"
      lead="Вечерний спешелти-бар в Минске: зерно с прозрачным происхождением, выпечка с утра и стол, который можно удержать на десять минут, пока оформляете заказ."
    >
      <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative min-h-[280px] overflow-hidden rounded-l border border-ink-500 sm:min-h-[380px]">
          <img
            src="/images/barista.png"
            alt="Бариста вливает молоко, создавая латте-арт"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="grid content-start gap-4 text-cream-dim">
          <h2 className="font-display text-2xl text-cream">Зачем мы открылись</h2>
          <p>
            Tactile — про тактильный опыт. Напиток можно разобрать по слоям: граммы, калории и цена
            пересчитываются на месте, без сюрприза в чеке. Бариста собирает чашку под ваш вкус, а не
            «как в карточке меню».
          </p>
          <p>
            Зал рассчитан на вечер: приглушённый свет, столы у окна и тихая зона для тех, кто пришёл
            с ноутбуком. Утром печём круассаны и чизкейк, днём отдаём самовывоз, к ночи держим слоты
            брони на два часа.
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-l border border-ink-500 bg-ink-800/40 p-6">
          <p className="eyebrow">Адрес</p>
          <h2 className="mt-3 font-display text-2xl text-cream">Минск, ул. Кофейная, 13</h2>
          <p className="mt-3 text-sm text-cream-dim">
            Вход со двора, второй этаж. Парковка вдоль улицы. Для зала с ноутбуком берите тихую зону —
            там розетки.
          </p>
          <a href="tel:+375291234567" className="mt-4 inline-block text-sm">
            +375 29 123-45-67
          </a>
        </div>
        <div className="rounded-l border border-ink-500 bg-ink-800/40 p-6">
          <p className="eyebrow">Часы</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {HOURS.map(([day, time]) => (
              <li key={day} className="flex justify-between gap-4 text-cream">
                <span className="text-cream-dim">{day}</span>
                <span>{time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-cream-dim">Кухня закрывается за час до конца смены.</p>
        </div>
        <div className="rounded-l border border-ink-500 bg-ink-800/40 p-6">
          <p className="eyebrow">Как заказать</p>
          <ul className="mt-4 grid gap-2 text-sm text-cream-dim">
            <li>В зале — бронь слота на 2 часа и заказ к столу.</li>
            <li>С собой — корзина без брони, забрать у барной стойки.</li>
            <li>Доставка появится в Telegram-боте на следующем этапе.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/booking" className="btn btn-gold">
              Столы
            </Link>
            <Link to="/menu" className="btn btn-ghost">
              Меню
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-cream">Зал</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {HALL.map(([zone, text]) => (
            <li key={zone} className="rounded-m border border-ink-500 px-4 py-4">
              <p className="font-semibold text-cream">{zone}</p>
              <p className="mt-1 text-sm text-cream-dim">{text}</p>
            </li>
          ))}
        </ul>
      </section>

    </ContentPage>
  );
}
