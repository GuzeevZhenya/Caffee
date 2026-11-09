import { useReveal } from "@/shared/lib";
import { FeatureCard } from "./FeatureCard";
import type { Feature } from "./types";

const FEATURES: Feature[] = [
  {
    title: "Зёрна спешелти",
    text: "Свежая обжарка каждую неделю, сезонные лоты из Эфиопии и Колумбии.",
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
    title: "Уютная атмосфера",
    text: "Вечерний свет, винил и кресла у окна. Работайте или расслабляйтесь.",
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
    title: "Персонализация состава",
    text: "Уберите сироп, добавьте шот — цена и КБЖУ пересчитаются мгновенно.",
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
    text: "Чемпионы региональных соревнований по латте-арту и каппингу.",
    icon: (
      <path
        d="M8 13 h18 v10 a3 3 0 0 1 -3 3 h-12 a3 3 0 0 1 -3 -3 Z M12 13 c0-4 2-6 5-6 s5 2 5 6 M12 18 h10"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    ),
  },
];

/** Секция «Почему мы»: сетка преимуществ кофейни */
export function FeaturesSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-20">
      <p className="eyebrow">Почему мы</p>
      <h2 className="section-title">Детали, ради которых возвращаются</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
