import { HoldTableButton } from "@/features/book-table";
import { HALL_LAYOUT, type HallFixture, type TableSlotStatus } from "@repo/shared";
import { useMemo, useState } from "react";

interface HallMapProps {
  tables: TableSlotStatus[];
  date: string;
  slot: string;
}

const { bounds } = HALL_LAYOUT;
const PAD = 0.4;
const VIEW_W = bounds.maxX - bounds.minX + PAD * 2;
const VIEW_H = bounds.maxZ - bounds.minZ + PAD * 2;

function toSvgX(x: number): number {
  return x - bounds.minX + PAD;
}

function toSvgY(z: number): number {
  return z - bounds.minZ + PAD;
}

function fixtureClass(kind: HallFixture["kind"]): string {
  switch (kind) {
    case "wall":
      return "fill-ink-600 stroke-ink-500";
    case "window":
      return "fill-mint/25 stroke-mint/60";
    case "door":
      return "fill-gold/35 stroke-gold";
    case "toilet":
      return "fill-ink-700 stroke-ink-500";
    case "bar":
      return "fill-gold-deep/40 stroke-gold/50";
    case "label":
      return "fill-transparent stroke-none";
    default:
      return "fill-ink-700";
  }
}

function statusFill(status: TableSlotStatus["status"], heldByMe: boolean): string {
  if (heldByMe) return "var(--color-gold)";
  if (status === "FREE") return "oklch(0.45 0.06 160)";
  if (status === "HELD") return "oklch(0.55 0.1 62)";
  return "oklch(0.5 0.12 25)";
}

/**
 * 2D-план зала: стены, окна, вход, WC, бар + кликабельные столы.
 * Координаты столов — из position3D (x/z).
 */
export function HallMap({ tables, date, slot }: HallMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? null,
    [tables, selectedId],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.75fr)] lg:items-start">
      <div className="overflow-hidden rounded-l border border-ink-500/80 bg-ink-800/50 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full"
          role="img"
          aria-label="План зала кофейни"
        >
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            className="fill-ink-900/80"
            rx={0.15}
          />

          {HALL_LAYOUT.fixtures.map((fixture) => {
            const x = toSvgX(fixture.x);
            const y = toSvgY(fixture.z);
            if (fixture.kind === "label") {
              return (
                <text
                  key={fixture.id}
                  x={x + fixture.width / 2}
                  y={y + fixture.depth / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-cream-dim"
                  style={{ fontSize: 0.35 }}
                >
                  {fixture.label}
                </text>
              );
            }
            return (
              <g key={fixture.id}>
                <rect
                  x={x}
                  y={y}
                  width={fixture.width}
                  height={fixture.depth}
                  className={fixtureClass(fixture.kind)}
                  strokeWidth={0.04}
                  rx={0.08}
                />
                {fixture.label && fixture.kind !== "window" ? (
                  <text
                    x={x + fixture.width / 2}
                    y={y + fixture.depth / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-cream"
                    style={{ fontSize: 0.32, fontWeight: 600 }}
                  >
                    {fixture.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {tables.map((table) => {
            const [px, , pz] = table.position3D;
            const cx = toSvgX(px);
            const cy = toSvgY(pz);
            const r = table.seats >= 6 ? 0.55 : table.seats >= 4 ? 0.48 : 0.4;
            const isSelected = selectedId === table.id;
            return (
              <g key={table.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={statusFill(table.status, table.heldByMe)}
                  stroke={isSelected ? "var(--color-cream)" : "oklch(0.25 0.02 55)"}
                  strokeWidth={isSelected ? 0.08 : 0.04}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => setSelectedId(table.id)}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-ink-900"
                  style={{ fontSize: 0.36, fontWeight: 700 }}
                >
                  {table.number}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-cream-dim">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mint/70" /> Свободен
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gold/70" /> Холд
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-warm/70" /> Занят
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-mint/30 ring-1 ring-mint/50" /> Окно
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-gold/40 ring-1 ring-gold/60" /> Вход
          </span>
        </div>
      </div>

      <aside className="grid gap-3 rounded-l border border-ink-500/80 bg-ink-800/40 p-4">
        {selected ? (
          <>
            <div>
              <p className="eyebrow">Столик</p>
              <h2 className="font-display text-xl font-semibold">{selected.title}</h2>
              <p className="mt-1 text-sm text-cream-dim">
                {selected.seats} мест · {selected.zone}
                {selected.hasPowerOutlet ? " · розетка" : ""}
              </p>
            </div>
            <HoldTableButton table={selected} date={date} slot={slot} />
            <p className="text-xs text-cream-dim">
              Холд на 10 минут. После удержания стол привяжется к корзине — можно оформить заказ «в
              кафе».
            </p>
          </>
        ) : (
          <p className="text-sm text-cream-dim">
            Нажмите на столик на плане, чтобы увидеть места и забронировать слот.
          </p>
        )}
      </aside>
    </div>
  );
}
