import { Link } from "react-router";

/**
 * Hero: одно full-bleed кофейное фото (фон) + текст.
 * На desktop блок на всю ширину; cup в кадре справа через object-position.
 */
export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[min(68dvh,560px)] overflow-hidden sm:min-h-[min(72dvh,640px)] lg:min-h-[min(80dvh,760px)]">
      <img
        src="/drinks/cappuccino.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full scale-[1.12] object-cover object-[78%_38%] max-md:object-[60%_42%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.145_0.008_55/0.94)_0%,oklch(0.145_0.008_55/0.78)_36%,oklch(0.145_0.008_55/0.28)_68%,oklch(0.145_0.008_55/0.45)_100%)] max-md:bg-[linear-gradient(180deg,oklch(0.145_0.008_55/0.55)_0%,oklch(0.145_0.008_55/0.82)_55%,oklch(0.145_0.008_55/0.92)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-900 to-transparent"
      />

      <div className="wrap relative flex min-h-[inherit] items-end pb-12 pt-16 sm:items-center sm:py-16 lg:pb-20">
        <div className="w-full max-w-[36rem] max-md:mx-auto max-md:text-center lg:max-w-[40rem]">
          <p className="font-display text-[clamp(17px,2.2vw,22px)] italic text-gold">
            Глубокий. Мягкий. Точный.
          </p>
          <h1 className="mt-3 font-display text-[clamp(42px,9vw,88px)] font-bold leading-[0.92] tracking-[0.02em]">
            TACTILE
          </h1>
          <p className="mt-3 font-display text-[clamp(20px,3vw,34px)] font-semibold leading-tight text-cream">
            Кофе, который можно <em className="italic text-gold">разобрать по слоям</em>
          </p>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-cream-dim max-md:mx-auto sm:text-base">
            Спешелти-зёрна, честный состав и цена, которая пересчитывается на глазах — от
            граммовки до КБЖУ.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 max-md:justify-center">
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
