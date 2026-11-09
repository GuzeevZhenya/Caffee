import type { Quote } from "./types";

/** Карточка отзыва: 5 звёзд, текст, подпись гостя */
export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <article className="card grid content-start gap-3 !transform-none">
      <span className="text-[15px] tracking-[3px] text-gold" aria-label="5 из 5">
        ★★★★★
      </span>
      <blockquote className="font-display text-[17px] italic leading-normal">
        {quote.text}
      </blockquote>
      <cite className="text-[13.5px] not-italic text-cream-dim">{quote.cite}</cite>
    </article>
  );
}
