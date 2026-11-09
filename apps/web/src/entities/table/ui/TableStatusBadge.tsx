import type { TableRealtimeStatus } from "@repo/shared";

const STATUS_META: Record<TableRealtimeStatus, { label: string; className: string }> = {
  FREE: { label: "Свободен", className: "bg-mint/15 text-mint" },
  HELD: { label: "Бронируется", className: "bg-gold/15 text-gold" },
  BOOKED: { label: "Занят", className: "bg-rose-warm/15 text-rose-warm" },
};

/** Плашка статуса столика на выбранный слот */
export function TableStatusBadge({ status }: { status: TableRealtimeStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
