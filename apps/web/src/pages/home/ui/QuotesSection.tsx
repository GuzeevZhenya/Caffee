import { useReveal } from "@/shared/lib";
import { QuoteCard } from "./QuoteCard";
import type { Quote } from "./types";

const QUOTES: Quote[] = [
  {
    text: "«Впервые видела меню, где можно буквально разобрать напиток на слои. Выбрала раф без сиропа — цена сразу пересчиталась».",
    cite: "Анна М. — гость зоны у окна",
  },
  {
    text: "«Забронировал стол на карте зала за минуту. Холд честный: десять минут на оформление, и никакого овербукинга».",
    cite: "Дмитрий К. — завсегдатай вечерних слотов",
  },
  {
    text: "«Тирамису в exploded view — это что-то. Слои видно как в часовом механизме. Вкус, кстати, тоже на уровне».",
    cite: "Ольга С. — пришла за чизкейком, осталась за кофе",
  },
];

/** Секция «Отзывы»: что говорят гости */
export function QuotesSection() {
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} className="wrap mt-20">
      <p className="eyebrow">Отзывы</p>
      <h2 className="section-title">Что говорят гости</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {QUOTES.map((quote) => (
          <QuoteCard key={quote.cite} quote={quote} />
        ))}
      </div>
    </section>
  );
}
