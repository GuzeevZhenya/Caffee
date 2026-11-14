import type { ReactNode } from "react";
import { NavLink } from "react-router";

interface TmaShellProps {
  guestName: string;
  cartCount: number;
  showHomeBanner: boolean;
  onAddHome: () => void;
  onDismissHome: () => void;
  children: ReactNode;
}

const NAV = [
  { to: "/tma", label: "Меню", end: true },
  { to: "/tma/cart", label: "Корзина", end: false },
  { to: "/tma/booking", label: "Столы", end: false },
  { to: "/tma/checkout", label: "Заказ", end: false },
] as const;

/** Оболочка Mini App: приветствие, нижние вкладки, без шапки сайта. */
export function TmaShell({
  guestName,
  cartCount,
  showHomeBanner,
  onAddHome,
  onDismissHome,
  children,
}: TmaShellProps) {
  return (
    <div className="tma-shell">
      {showHomeBanner ? (
        <div className="mx-3 mt-3 flex items-center gap-3 rounded-m border border-gold/40 bg-ink-800 px-3 py-2.5">
          <p className="min-w-0 flex-1 text-sm text-cream">Добавить кофейню на главный экран</p>
          <button type="button" className="btn btn-gold !min-h-0 !px-3 !py-1.5 text-xs" onClick={onAddHome}>
            Добавить
          </button>
          <button type="button" className="text-cream-dim" onClick={onDismissHome} aria-label="Скрыть">
            ×
          </button>
        </div>
      ) : null}

      <header className="wrap pt-5 pb-2">
        <p className="text-sm text-cream-dim">Tactile Craft Coffee</p>
        <h1 className="font-display text-[28px] leading-tight">Привет, {guestName}</h1>
      </header>

      <div className="flex-1">{children}</div>

      <nav className="tma-nav" aria-label="Разделы приложения">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="tma-nav-item"
          >
            {item.label}
            {item.to === "/tma/cart" && cartCount > 0 ? (
              <span className="tma-nav-badge">{cartCount}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
