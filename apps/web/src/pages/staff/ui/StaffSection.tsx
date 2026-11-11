import type { ReactNode } from "react";

export function StaffSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="wrap flex flex-col gap-6 py-10 sm:py-14">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title">{title}</h1>
      </div>
      {children}
    </div>
  );
}
