import { useAppSelector } from "@/app/store";
import { selectCartCount } from "@/features/cart";
import { Link, NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/", label: "Главная" },
  { to: "/menu", label: "Меню" },
  { to: "/booking", label: "Столы" },
] as const;

const LOGO_SVG = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M13 5v4M13 11.5v3.5M13 17.5V21"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="13" cy="10" r="1.6" fill="currentColor" />
    <circle cx="13" cy="16" r="1.6" fill="currentColor" />
  </svg>
);

/** Шапка «вечернего эспрессо-бара»: логотип, пилюли навигации, счётчик корзины */
export function AppHeader() {
  const cartCount = useAppSelector(selectCartCount);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-500 bg-ink-900/80 backdrop-blur-[14px]">
      <div className="wrap flex min-h-[68px] flex-wrap items-center gap-x-8 gap-y-2 py-2.5">
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap font-display text-[17px] font-bold tracking-[0.02em] text-cream hover:text-gold"
          aria-label="Tactile Craft Coffee — на главную"
        >
          {LOGO_SVG}
          <span>TACTILE</span>
        </Link>

        <nav className="flex w-full items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:ml-auto lg:w-auto [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-pill">
              {({ isActive }) => <span data-active={isActive || undefined}>{item.label}</span>}
            </NavLink>
          ))}
          <NavLink to="/checkout" className="nav-pill" aria-label="Корзина">
            {({ isActive }) => (
              <span data-active={isActive || undefined} className="inline-flex items-center gap-2">
                Корзина
                {cartCount > 0 ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-deep px-1.5 text-xs font-bold text-cream">
                    {cartCount}
                  </span>
                ) : null}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
