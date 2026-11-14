import { useReveal } from "@/shared/lib";
import { Link } from "react-router";

const CHECKS = [
  "Спешелти-лоты с прозрачным происхождением",
  "Свежая обжарка под наш профиль",
  "Честный состав по слоям и граммовке",
  "Бариста собирает напиток под ваш вкус",
] as const;

const ABOUT_STATS: Array<[string, string]> = [
  ["3+", "года в Минске"],
  ["16", "позиций меню"],
  ["25K+", "чашек за сезон"],
  ["4.9", "рейтинг гостей"],
];

/** About: фото бариста + чеклист + цифры (BODRIN structure) */
export function AboutSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} id="about" className="wrap mt-16 sm:mt-24">
      <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-full min-h-[280px] overflow-hidden rounded-l border border-ink-500 sm:min-h-[360px]">
          <img
            src="/images/barista.png"
            alt="Бариста вливает молоко, создавая латте-арт"
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0.145_0.008_55/0.75))]"
          />
        </div>

        <div className="grid gap-5">
          <p className="eyebrow">About Us</p>
          <h2 className="section-title !mt-0">
            Больше, чем просто{" "}
            <em className="italic text-gold">кофе</em>
          </h2>
          <p className="max-w-[48ch] text-cream-dim">
            Tactile — про тактильный опыт: увидеть слои, понять состав, собрать напиток под себя.
            Вечерний зал, спешелти и меню без сюрпризов в чеке.
          </p>
          <ul className="grid gap-2.5">
            {CHECKS.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-cream">
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink-900"
                >
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4">
            {ABOUT_STATS.map(([strong, span]) => (
              <div key={strong} className="rounded-m border border-ink-500 bg-ink-800/40 p-3 sm:p-4">
                <strong className="block font-display text-[24px] text-gold sm:text-[28px]">
                  {strong}
                </strong>
                <span className="text-[12px] text-cream-dim sm:text-[13px]">{span}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to="/menu" className="btn btn-primary">
              Узнать меню
            </Link>
            <Link to="/about" className="btn btn-ghost">
              О кофейне
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
