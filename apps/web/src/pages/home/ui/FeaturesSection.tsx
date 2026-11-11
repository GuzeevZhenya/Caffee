import { useReveal } from "@/shared/lib";

const FEATURES = [
  {
    title: "Спешелти-зёрна",
    text: "Свежая обжарка каждую неделю",
    icon: (
      <ellipse
        cx="17"
        cy="17"
        rx="10"
        ry="14"
        stroke="currentColor"
        strokeWidth="1.6"
        transform="rotate(25 17 17)"
      />
    ),
  },
  {
    title: "Уютный зал",
    text: "Вечерний свет и места у окна",
    icon: (
      <path
        d="M5 15 C5 8 11 5 17 5 C23 5 29 8 29 15 L29 26 C29 28 27 29 25 29 L9 29 C7 29 5 28 5 26 Z M11 15 h12 M11 20 h12"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    ),
  },
  {
    title: "Состав по слоям",
    text: "Цена и КБЖУ пересчитываются сразу",
    icon: (
      <>
        <circle cx="17" cy="17" r="12" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M17 9 v8 l6 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  {
    title: "Бариста-профи",
    text: "Латте-арт и точный экстракт",
    icon: (
      <path
        d="M8 13 h18 v10 a3 3 0 0 1 -3 3 h-12 a3 3 0 0 1 -3 -3 Z M12 13 c0-4 2-6 5-6 s5 2 5 6 M12 18 h10"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    ),
  },
] as const;

/** Полоса преимуществ — без «карточного» хрома, как value-bar у Brew Haven */
export function FeaturesSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="mt-16 border-y border-ink-500 bg-ink-800/60 sm:mt-24">
      <div className="wrap grid grid-cols-2 gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="grid justify-items-center gap-2 text-center">
            <svg
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              aria-hidden="true"
              className="text-gold"
            >
              {feature.icon}
            </svg>
            <h3 className="font-display text-base font-semibold sm:text-lg">{feature.title}</h3>
            <p className="max-w-[18ch] text-xs text-cream-dim sm:text-sm">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
