import { demoStaffAllowed } from "../lib/demo-staff";
import { rejectUnlessBot } from "../lib/bot-auth";
import { upsertLocalGuest } from "../lib/staff-board";
import { prisma } from "@repo/database";
import {
  BOOKING_REMINDER_MINUTES,
  botProfileSchema,
  reminderAckSchema,
  type BotProfileResponse,
  type DueBookingReminder,
} from "@repo/shared";
import { Hono } from "hono";

function toTelegramId(value: bigint | null | undefined): string | null {
  return value == null ? null : value.toString();
}

export const botRoutes = new Hono()
  .use("*", async (c, next) => {
    const denied = rejectUnlessBot(c);
    if (denied) return denied;
    await next();
  })
  /**
   * POST /api/bot/profile — имя и телефон гостя из Telegram.
   */
  .post("/profile", async (c) => {
    const parsed = botProfileSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    const input = parsed.data;
    const telegramId = BigInt(input.telegramId);

    try {
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: {
          firstName: input.firstName,
          phone: input.phone,
          username: input.username ?? undefined,
        },
        create: {
          telegramId,
          firstName: input.firstName,
          phone: input.phone,
          username: input.username,
        },
      });
      const response: BotProfileResponse = {
        telegramId: toTelegramId(user.telegramId) ?? input.telegramId,
        firstName: user.firstName ?? input.firstName,
        phone: user.phone ?? input.phone,
      };
      return c.json(response);
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code === "P2002") {
        const byPhone = await prisma.user.findUnique({ where: { phone: input.phone } });
        if (byPhone) {
          const user = await prisma.user.update({
            where: { id: byPhone.id },
            data: {
              telegramId,
              firstName: input.firstName,
              username: input.username ?? undefined,
            },
          });
          const response: BotProfileResponse = {
            telegramId: toTelegramId(user.telegramId) ?? input.telegramId,
            firstName: user.firstName ?? input.firstName,
            phone: user.phone ?? input.phone,
          };
          return c.json(response);
        }
      }
      if (demoStaffAllowed()) {
        const saved = upsertLocalGuest({
          telegramId: input.telegramId,
          firstName: input.firstName,
          phone: input.phone,
          username: input.username,
        });
        return c.json(saved satisfies BotProfileResponse);
      }
      console.error("[api/bot/profile]", error instanceof Error ? error.message : error);
      return c.json({ error: "database_unavailable" }, 503);
    }
  })
  /**
   * GET /api/bot/due-reminders — брони в ближайшие 15 минут без пуша бота.
   */
  .get("/due-reminders", async (c) => {
    const now = new Date();
    const until = new Date(now.getTime() + BOOKING_REMINDER_MINUTES * 60_000);

    try {
      const bookings = await prisma.booking.findMany({
        where: {
          reminderSent: false,
          startTime: { gt: now, lte: until },
          status: { in: ["HELD", "CONFIRMED"] },
          user: { telegramId: { not: null } },
        },
        include: {
          user: { select: { telegramId: true, firstName: true } },
          orders: {
            where: { status: "COOKING_HOLD" },
            select: { id: true, orderNumber: true },
          },
        },
      });

      const reminders: DueBookingReminder[] = bookings.flatMap((booking) => {
        const telegramId = toTelegramId(booking.user.telegramId);
        if (!telegramId) return [];
        return [
          {
            bookingId: booking.id,
            telegramId,
            firstName: booking.user.firstName,
            startTime: booking.startTime.toISOString(),
            orders: booking.orders.map((order) => ({
              orderId: order.id,
              orderNumber: order.orderNumber,
            })),
          },
        ];
      });
      return c.json({ reminders });
    } catch (error) {
      if (demoStaffAllowed()) {
        return c.json({ reminders: [] as DueBookingReminder[] });
      }
      console.error("[api/bot/due-reminders]", error instanceof Error ? error.message : error);
      return c.json({ error: "database_unavailable" }, 503);
    }
  })
  /**
   * POST /api/bot/reminders/ack — бот отправил напоминание, повторно не слать.
   */
  .post("/reminders/ack", async (c) => {
    const parsed = reminderAckSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    try {
      await prisma.booking.update({
        where: { id: parsed.data.bookingId },
        data: { reminderSent: true },
      });
      return c.json({ ok: true });
    } catch (error) {
      if (demoStaffAllowed()) {
        return c.json({ ok: true });
      }
      console.error("[api/bot/reminders/ack]", error instanceof Error ? error.message : error);
      return c.json({ error: "database_unavailable" }, 503);
    }
  });
