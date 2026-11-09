import { broadcastTableLock } from "../lib/broadcast";
import {
  getTableLock,
  getTableLocks,
  lockTable,
  prisma,
  TABLE_LOCK_TTL_SECONDS,
  toCafeTableConfig,
  unlockTable,
  type TableLock,
} from "@repo/database";
import {
  holdTableSchema,
  MOCK_TABLES,
  tableSlotQuerySchema,
  type CafeTableConfig,
  type HoldTableResponse,
  type TableSlotStatus,
} from "@repo/shared";
import { Hono } from "hono";
import { z } from "zod";

/** Длительность слота брони по умолчанию (мин) — для проверки пересечений */
const SLOT_DURATION_MINUTES = 90;

const releaseBodySchema = z.object({
  tableId: z.string().min(1),
  slotStart: z.coerce.date(),
});

export const tablesRoutes = new Hono()
  /**
   * GET /api/tables?date=YYYY-MM-DD&slot=HH:mm[&guestsCount=2][&hasPowerOutlet=true]
   * Все столики со статусом на выбранный слот: FREE / HELD (Redis) / BOOKED (Booking).
   */
  .get("/", async (c) => {
    const parsed = tableSlotQuerySchema.safeParse({
      date: c.req.query("date"),
      slot: c.req.query("slot"),
      guestsCount: c.req.query("guestsCount"),
      hasPowerOutlet: c.req.query("hasPowerOutlet"),
    });
    if (!parsed.success) {
      return c.json({ error: "invalid_query", issues: parsed.error.issues }, 400);
    }

    const { date, slot, guestsCount, hasPowerOutlet } = parsed.data;
    const slotStart = new Date(`${date}T${slot}:00`);
    if (Number.isNaN(slotStart.getTime())) {
      return c.json({ error: "invalid_slot_datetime" }, 400);
    }
    const slotStartIso = slotStart.toISOString();
    const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60_000);
    const guestId = c.req.header("x-guest-id");

    // 1. Столы и пересекающиеся брони — из БД; без БД столы берём из моков
    let tables: CafeTableConfig[];
    let bookedTableIds = new Set<string>();
    try {
      const [rows, bookings] = await Promise.all([
        prisma.cafeTable.findMany({ where: { isActive: true }, orderBy: { number: "asc" } }),
        prisma.booking.findMany({
          where: {
            startTime: { lt: slotEnd },
            endTime: { gt: slotStart },
            status: { in: ["HELD", "CONFIRMED", "SEATED"] },
          },
          select: { tableId: true },
        }),
      ]);
      tables = rows.map(toCafeTableConfig);
      bookedTableIds = new Set(bookings.map((booking) => booking.tableId));
    } catch (error) {
      console.warn(
        "[api/tables] БД недоступна, отдаю моковые столы:",
        error instanceof Error ? error.message : error,
      );
      tables = MOCK_TABLES;
    }

    // 2. Redis-локи на слот (одним mget). Без Redis — все столы без холдов
    let locks: Record<string, TableLock> = {};
    try {
      locks = await getTableLocks(
        tables.map((table) => table.id),
        slotStartIso,
      );
    } catch {
      // Upstash не настроен — статусы только из БД
    }

    // 3. Фильтры запроса + сборка статусов
    const result: TableSlotStatus[] = tables
      .filter((table) => (guestsCount ? table.seats >= guestsCount : true))
      .filter((table) => (hasPowerOutlet ? table.hasPowerOutlet : true))
      .map((table) => {
        const lock = locks[table.id];
        const heldByMe = Boolean(lock && guestId && lock.userId === guestId);
        return {
          ...table,
          status: lock ? "HELD" : bookedTableIds.has(table.id) ? "BOOKED" : "FREE",
          heldUntil: lock?.expiresAt ?? null,
          heldByMe,
        };
      });

    return c.json(result);
  })
  /**
   * POST /api/tables/hold — временный лок стола в Redis на 10 минут.
   * Атомарно (SET NX EX): если стол уже держит другой гость — 409.
   * TODO(Фаза 4): после авторизации создавать Booking со статусом HELD в БД.
   */
  .post("/hold", async (c) => {
    const parsed = holdTableSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    const guestId = c.req.header("x-guest-id") ?? "anonymous";
    const { tableId, startTime } = parsed.data;
    const slotStartIso = startTime.toISOString();

    try {
      const locked = await lockTable(tableId, slotStartIso, guestId);

      if (!locked) {
        const existing = await getTableLock(tableId, slotStartIso);
        const response: HoldTableResponse = {
          locked: false,
          tableId,
          slotStart: slotStartIso,
          heldUntil: existing?.expiresAt ?? null,
        };
        return c.json(response, 409);
      }

      const heldUntil = new Date(Date.now() + TABLE_LOCK_TTL_SECONDS * 1000).toISOString();

      // Мгновенный статус «Бронируется другим гостем» для всех клиентов (best-effort)
      await broadcastTableLock({
        type: "TABLE_HELD",
        payload: {
          tableId,
          slotStart: slotStartIso,
          status: "HELD",
          heldByUserId: guestId,
          heldUntil,
        },
        at: new Date().toISOString(),
      });

      const response: HoldTableResponse = {
        locked: true,
        tableId,
        slotStart: slotStartIso,
        heldUntil,
      };
      return c.json(response);
    } catch (error) {
      console.error(
        "[api/tables/hold] Redis недоступен:",
        error instanceof Error ? error.message : error,
      );
      return c.json({ error: "locks_unavailable" }, 503);
    }
  })
  /**
   * DELETE /api/tables/hold — досрочное снятие своего лока.
   * Чужой лок снять нельзя (проверка владельца внутри unlockTable).
   */
  .delete("/hold", async (c) => {
    const parsed = releaseBodySchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    const guestId = c.req.header("x-guest-id") ?? "anonymous";
    const slotStartIso = parsed.data.slotStart.toISOString();

    try {
      const released = await unlockTable(parsed.data.tableId, slotStartIso, guestId);

      if (released) {
        await broadcastTableLock({
          type: "TABLE_RELEASED",
          payload: {
            tableId: parsed.data.tableId,
            slotStart: slotStartIso,
            status: "FREE",
            heldByUserId: null,
            heldUntil: null,
          },
          at: new Date().toISOString(),
        });
      }

      return c.json({ released });
    } catch (error) {
      console.error(
        "[api/tables/hold] Redis недоступен:",
        error instanceof Error ? error.message : error,
      );
      return c.json({ error: "locks_unavailable" }, 503);
    }
  });
