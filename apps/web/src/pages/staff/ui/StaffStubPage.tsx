import { useAppSelector } from "@/app/store";
import { selectStaffUser } from "@/features/staff-auth";

interface StaffStubPageProps {
  title: string;
  description: string;
}

/** Заглушка вкладки кабинета (срез 1 — без бизнес-логики) */
export function StaffStubPage({ title, description }: StaffStubPageProps) {
  const user = useAppSelector(selectStaffUser);

  return (
    <div className="wrap flex flex-col gap-4 py-10 sm:py-14">
      <div>
        <p className="eyebrow">Кабинет · {user?.role === "ADMIN" ? "Админ" : "Сотрудник"}</p>
        <h1 className="section-title">{title}</h1>
        <p className="section-sub">{description}</p>
      </div>
      <p className="rounded-m border border-ink-500/80 bg-ink-800/40 px-4 py-3 text-sm text-cream-dim">
        Раздел появится в следующих срезах админки. Сейчас — только каркас навигации.
      </p>
    </div>
  );
}
