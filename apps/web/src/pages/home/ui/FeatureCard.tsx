import type { Feature } from "./types";

/** Иконка преимущества: SVG 34×34, цвет наследуется от текста (золотой) */
function FeatureIcon({ icon }: { icon: Feature["icon"] }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
      className="text-gold"
    >
      {icon}
    </svg>
  );
}

/** Карточка преимущества: иконка, заголовок, короткий текст */
export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="card grid content-start gap-3 !transform-none">
      <FeatureIcon icon={feature.icon} />
      <h3 className="text-lg">{feature.title}</h3>
      <p className="text-sm text-cream-dim">{feature.text}</p>
    </article>
  );
}
