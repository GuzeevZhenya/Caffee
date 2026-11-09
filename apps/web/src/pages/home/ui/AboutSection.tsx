import { useReveal } from "@/shared/lib";

const ABOUT_STATS: Array<[string, string]> = [
  ["3 года", "варим кофе в Минске"],
  ["25K+", "чашек за сезон"],
  ["4.9", "рейтинг гостей"],
  ["12", "позиций в меню"],
];

/** Секция «О кофейне»: фото бариста и статистика */
export function AboutSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-20">
      <div className="card grid !transform-none items-center gap-8 overflow-hidden p-0 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-[300px] lg:min-h-[420px]">
          <img
            src="/images/barista.png"
            alt="Бариста вливает молоко, создавая латте-арт"
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_55%,var(--color-ink-700)_100%)]" />
        </div>
        <div className="grid gap-4 p-6 lg:py-12 lg:pr-12">
          <p className="eyebrow">О кофейне</p>
          <h2 className="section-title">Tactile — про тактильный кофе</h2>
          <p className="max-w-[52ch] text-cream-dim">
            Мы верим, что хороший кофе можно «потрогать»: увидеть слои, понять состав, собрать
            напиток под себя. Поэтому наше меню — живое и честное.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {ABOUT_STATS.map(([strong, span]) => (
              <div key={strong} className="rounded-m border border-ink-500 p-4">
                <strong className="block font-display text-[28px] text-gold">{strong}</strong>
                <span className="text-[13px] text-cream-dim">{span}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
