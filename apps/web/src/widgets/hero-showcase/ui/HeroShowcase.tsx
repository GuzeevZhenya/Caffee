import { Link } from "react-router";

/**
 * Hero: фото капучино отдельным кадром, без растягивания на весь экран.
 */
export function HeroShowcase() {
  return (
    <section className="border-b border-ink-500/60">
      <div className="wrap grid items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,380px)] lg:gap-12 lg:py-14">
        <div className="max-w-[36rem]">
          <p className="font-display text-[clamp(17px,2.2vw,22px)] italic text-gold">
            Глубокий. Мягкий. Точный.
          </p>
          <h1 className="mt-3 font-display text-[clamp(42px,7vw,76px)] font-bold leading-[0.92] tracking-[0.02em]">
            TACTILE
          </h1>
          <p className="mt-3 font-display text-[clamp(20px,3vw,32px)] font-semibold leading-tight text-cream">
            Кофе, который можно <em className="italic text-gold">разобрать по слоям</em>
          </p>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-cream-dim sm:text-base">
            Спешелти-зёрна, честный состав и цена, которая пересчитывается на глазах — от
            граммовки до КБЖУ.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/menu" className="btn btn-primary">
              Смотреть меню
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/booking" className="btn btn-ghost">
              Забронировать стол
            </Link>
          </div>
        </div>

        <img
          src="/drinks/cappuccino.jpg"
          alt="Капучино Tactile"
          className="mx-auto aspect-[4/5] w-full max-w-[380px] rounded-l object-cover object-[50%_30%] shadow-[0_24px_60px_oklch(0_0_0/0.35)]"
        />
      </div>
    </section>
  );
}
