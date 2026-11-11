import { useReveal } from "@/shared/lib";
import { QuoteCard } from "./QuoteCard";
import type { Quote } from "./types";

const QUOTES: Quote[] = [
  {
    text: "«Впервые видела меню, где можно буквально разобрать напиток на слои. Выбрала раф без сиропа — цена сразу пересчиталась».",
    cite: "Анна М. — гость зоны у окна",
  },
  {
    text: "«Забронировал стол за минуту. Холд честный: десять минут на оформление, и никакого овербукинга».",
    cite: "Дмитрий К. — вечерние слоты",
  },
  {
    text: "«Тирамису по слоям — как часовой механизм. Вкус тоже на уровне: пришла за десертом, осталась за кофе».",
    cite: "Ольга С. — за чизкейком",
  },
];

/** Отзывы гостей (BODRIN testimonials) */
export function QuotesSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-16 sm:mt-24">
      <div className="text-center">
        <p className="eyebrow eyebrow-center justify-center">Reviews</p>
        <h2 className="section-title">Что говорят гости</h2>
      </div>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
        {QUOTES.map((quote) => (
          <QuoteCard key={quote.cite} quote={quote} />
        ))}
      </div>
    </section>
  );
}
