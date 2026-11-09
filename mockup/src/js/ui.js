// Общий UI: шапка, счётчик корзины, reveal-анимации.
import { cartCount } from "./store.js";

const NAV = [
  { href: "./index.html", label: "Главная" },
  { href: "./menu.html", label: "Меню" },
  { href: "./booking.html", label: "Столы" },
];

const LOGO_SVG = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
  <circle cx="13" cy="13" r="12" stroke="currentColor" stroke-width="1.6"/>
  <path d="M13 5v4M13 11.5v3.5M13 17.5V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="13" cy="10" r="1.6" fill="currentColor"/>
  <circle cx="13" cy="16" r="1.6" fill="currentColor"/>
</svg>`;

export function mountHeader(active) {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap">
      <a class="logo" href="./index.html" aria-label="Tactile Craft Coffee — на главную">
        ${LOGO_SVG}<span>TACTILE</span>
      </a>
      <nav class="main-nav" aria-label="Основная навигация">
        ${NAV.map(
          (n) =>
            `<a href="${n.href}" ${n.label === active ? 'aria-current="page"' : ""}>${n.label}</a>`
        ).join("")}
        <a href="./checkout.html" class="cart-link ${active === "Корзина" ? "" : ""}" aria-label="Корзина">
          Корзина<span class="cart-badge" data-cart-badge></span>
        </a>
      </nav>
    </div>`;
  document.body.prepend(header);
  updateBadge();
  window.addEventListener("tc:store", updateBadge);
}

function updateBadge() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;
  const count = cartCount();
  badge.textContent = count > 0 ? String(count) : "";
  badge.dataset.count = String(count);
}

export function mountFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <span>© 2026 Tactile Craft Coffee &amp; Bakery — интерактивный макет</span>
      <span>Минск, ул. Кофейная, 13 · ежедневно 08:00–23:00</span>
    </div>`;
  document.body.append(footer);
}

export function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((t) => t.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  targets.forEach((t) => io.observe(t));
}
