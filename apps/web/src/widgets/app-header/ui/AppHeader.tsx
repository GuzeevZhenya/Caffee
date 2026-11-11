import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectCartCount } from "@/features/cart";
import {
  clearSession,
  selectStaffUser,
  staffNavForRole,
} from "@/features/staff-auth";
import { Link, NavLink } from "react-router";

const GUEST_NAV = [
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

/** Шапка: гостевая навигация или кабинет персонала после логина */
export function AppHeader() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const staffUser = useAppSelector(selectStaffUser);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-500 bg-ink-900/80 backdrop-blur-[14px]">
      <div className="wrap relative flex min-h-[60px] items-center gap-3 py-2 sm:min-h-[68px] sm:gap-5 sm:py-2.5">
        <Link
          to={staffUser ? staffNavForRole(staffUser.role)[0]?.to ?? "/staff/orders" : "/"}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-[16px] font-bold tracking-[0.02em] text-cream hover:text-gold sm:gap-2.5 sm:text-[17px]"
          aria-label="Tactile Craft Coffee — на главную"
        >
          {LOGO_SVG}
          <span>TACTILE</span>
        </Link>

        {staffUser ? (
          <nav className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1">
            {staffNavForRole(staffUser.role).map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-pill">
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/" className="nav-pill">
              Сайт
            </NavLink>
            <button
              type="button"
              onClick={() => dispatch(clearSession())}
              className="nav-pill"
            >
              Выйти
            </button>
          </nav>
        ) : (
          <nav className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
            {GUEST_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-pill">
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/checkout"
              className="nav-pill inline-flex items-center gap-2"
              aria-label="Корзина"
            >
              Корзина
              {cartCount > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-deep px-1.5 text-xs font-bold text-cream">
                  {cartCount}
                </span>
              ) : null}
            </NavLink>
          </nav>
        )}

        {/* Невидимая точка входа в кабинет (правый край хедера) */}
        {!staffUser ? (
          <Link
            to="/staff/login"
            aria-label="Вход для персонала"
            className="absolute right-0 top-1/2 size-3 -translate-y-1/2 opacity-[0.02] hover:opacity-20"
            tabIndex={-1}
          />
        ) : null}
      </div>
    </header>
  );
}
