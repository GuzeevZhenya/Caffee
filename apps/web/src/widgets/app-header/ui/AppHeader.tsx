import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectCartCount } from "@/features/cart";
import {
  clearSession,
  selectStaffUser,
  staffNavForRole,
} from "@/features/staff-auth";
import { useEffect, useId, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

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

const CART_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6.5 8h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M9 8V7.2A3 3 0 0 1 12 4.2 3 3 0 0 1 15 7.2V8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/** Шапка: гостевая навигация или кабинет персонала после логина */
export function AppHeader() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const staffUser = useAppSelector(selectStaffUser);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const staffItems = staffUser ? staffNavForRole(staffUser.role) : [];

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
          <nav className="ml-auto hidden min-w-0 flex-wrap items-center justify-end gap-1 lg:flex">
            {staffItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-pill">
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/" className="nav-pill">
              Сайт
            </NavLink>
            <button type="button" onClick={() => dispatch(clearSession())} className="nav-pill">
              Выйти
            </button>
          </nav>
        ) : (
          <nav className="ml-auto hidden min-w-0 items-center gap-1 lg:flex">
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

        <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:hidden">
          {!staffUser ? (
            <NavLink to="/checkout" className="header-icon-btn relative" aria-label="Корзина">
              {CART_SVG}
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold-deep px-1 text-[10px] font-bold leading-none text-cream">
                  {cartCount}
                </span>
              ) : null}
            </NavLink>
          ) : null}
          <button
            type="button"
            className="header-icon-btn"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <span className="font-display text-2xl leading-none" aria-hidden="true">
                ×
              </span>
            ) : (
              <span className="relative block h-3.5 w-[18px]" aria-hidden="true">
                <span className="absolute left-0 top-0 block h-px w-full bg-current" />
                <span className="absolute left-0 top-1.5 block h-px w-full bg-current" />
                <span className="absolute left-0 top-3 block h-px w-full bg-current" />
              </span>
            )}
          </button>
        </div>

        {!staffUser ? (
          <Link
            to="/staff/login"
            aria-label="Вход для персонала"
            className="absolute right-0 top-1/2 hidden size-3 -translate-y-1/2 opacity-[0.02] hover:opacity-20 lg:block"
            tabIndex={-1}
          />
        ) : null}
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="header-drawer border-t border-ink-500 bg-ink-900 lg:hidden"
        >
          <nav className="wrap grid gap-1 py-3" aria-label="Мобильное меню">
            {staffUser ? (
              <>
                {staffItems.map((item) => (
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
                  className="nav-pill text-left"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                {GUEST_NAV.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-pill">
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/checkout" className="nav-pill">
                  Корзина
                  {cartCount > 0 ? ` · ${cartCount}` : ""}
                </NavLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
