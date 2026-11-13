import { Link } from "react-router";

/**
 * Hero на высоту экрана. Капучино — фон целиком (object-contain),
 * чашка и блюдце не обрезаются.
 */
export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[calc(100dvh-60px)] overflow-hidden border-b border-ink-500/60 sm:min-h-[calc(100dvh-68px)]">
      <img
        src="/drinks/cappuccino.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-contain object-bottom lg:object-right"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.145_0.008_55/0.92)_0%,oklch(0.145_0.008_55/0.55)_38%,oklch(0.145_0.008_55/0.18)_100%)] lg:bg-[linear-gradient(90deg,oklch(0.145_0.008_55)_0%,oklch(0.145_0.008_55/0.88)_38%,oklch(0.145_0.008_55/0.28)_62%,oklch(0.145_0.008_55/0.08)_82%,transparent_100%)]"
      />

      <div className="wrap relative z-10 flex min-h-[calc(100dvh-60px)] items-center py-12 sm:min-h-[calc(100dvh-68px)] sm:py-16">
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
      </div>
    </section>
  );
}
