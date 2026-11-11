import { useReveal } from "@/shared/lib";
import { Link } from "react-router";

/** CTA без второй картинки: один градиентный фон + текст */
export function CtaSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-16 sm:mt-24">
      <div className="relative overflow-hidden rounded-l border border-ink-500 bg-[radial-gradient(70%_90%_at_85%_20%,oklch(0.72_0.10_62/0.16),transparent_60%),var(--color-ink-700)] px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <p className="eyebrow">Ready?</p>
        <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(28px,4vw,44px)] font-semibold">
          Готовы к идеальному кофе?
        </h2>
        <p className="mt-3 max-w-[44ch] text-cream-dim">
          Соберите напиток по слоям или забронируйте стол у окна — вечер начинается с Tactile.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/menu" className="btn btn-primary">
            Заказать сейчас
          </Link>
          <Link to="/booking" className="btn btn-ghost">
            Столы
          </Link>
        </div>
      </div>
    </section>
  );
}
