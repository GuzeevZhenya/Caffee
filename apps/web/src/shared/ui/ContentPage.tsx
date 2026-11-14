import type { ReactNode } from "react";

/** Общая шапка текстовых страниц: о кофейне, персональные данные, правовая информация. */
export function ContentPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <article className="wrap flex flex-col gap-10 py-10 sm:py-16">
      <header className="max-w-[62ch]">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title">{title}</h1>
        {lead ? <p className="section-sub mt-3">{lead}</p> : null}
      </header>
      {children}
    </article>
  );
}
