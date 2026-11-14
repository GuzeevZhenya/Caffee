import { Link } from "react-router";

/** Футер: как у крупных .by-магазинов — документы гостю, без внутренней кухни. */
export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-ink-500 bg-ink-800/40 pt-12 pb-8 text-sm text-cream-dim sm:mt-28">
      <div className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3">
          <span className="font-display text-lg font-bold tracking-[0.04em] text-cream">
            TACTILE
          </span>
          <p className="max-w-[28ch] leading-relaxed">
            Craft Coffee &amp; Bakery. Слои, которые можно разобрать — и вкус, к которому
            возвращаются.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Навигация</p>
          <ul className="grid gap-2">
            <li>
              <Link to="/" className="hover:text-cream">
                Главная
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-cream">
                Меню
              </Link>
            </li>
            <li>
              <Link to="/booking" className="hover:text-cream">
                Столы
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-cream">
                Корзина
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Гостю</p>
          <ul className="grid gap-2">
            <li>
              <Link to="/about" className="hover:text-cream">
                О кофейне
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-cream">
                Персональные данные
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="hover:text-cream">
                Cookie
              </Link>
            </li>
            <li>
              <Link to="/legal" className="hover:text-cream">
                Юридическая информация
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Контакты</p>
          <ul className="grid gap-2">
            <li>Минск, ул. Кофейная, 13</li>
            <li>ежедневно 08:00–23:00</li>
            <li>
              <a href="tel:+375291234567" className="hover:text-cream">
                +375 29 123-45-67
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-10 flex flex-col gap-3 border-t border-ink-500 pt-6 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span>© 2026 Tactile Craft Coffee &amp; Bakery</span>
        <p>
          <Link to="/privacy" className="hover:text-cream">
            Политика персональных данных
          </Link>
          {" · "}
          <Link to="/cookies" className="hover:text-cream">
            Cookie
          </Link>
        </p>
      </div>
    </footer>
  );
}
