import { useReveal } from "@/shared/lib";
import { Link } from "react-router";

/** CTA-баннер: призыв к меню и бронированию */
export function CtaSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-20">
      <div className="rounded-l border border-ink-500 px-6 py-16 text-center [background:radial-gradient(55%_90%_at_50%_110%,oklch(0.72_0.10_62/0.14),transparent_70%),var(--color-ink-700)] lg:py-24">
        <p className="eyebrow eyebrow-center">Вечером мест нет</p>
        <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold">Готовы к идеальному кофе?</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-cream-dim">
          Соберите напиток под себя, забронируйте столик у окна — или закажите доставку до двери.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/menu" className="btn btn-primary">
            Смотреть меню
          </Link>
          <Link to="/booking" className="btn btn-ghost">
            Забронировать стол
          </Link>
        </div>
      </div>
    </section>
  );
}
