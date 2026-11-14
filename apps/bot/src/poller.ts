import type { Bot } from "grammy";
import { ackReminder, fetchDueReminders } from "./cafe-api";
import type { CafeContext } from "./context";
import { cookKeyboard, reminderText } from "./format";

const TICK_MS = 60_000;
const sent = new Set<string>();

async function tick(bot: Bot<CafeContext>): Promise<void> {
  const reminders = await fetchDueReminders();
  for (const reminder of reminders) {
    if (sent.has(reminder.bookingId)) continue;
    const order = reminder.orders[0];
    try {
      await bot.api.sendMessage(
        reminder.telegramId,
        reminderText(reminder.firstName, reminder.startTime),
        order ? { reply_markup: cookKeyboard(order.orderId) } : undefined,
      );
      sent.add(reminder.bookingId);
      await ackReminder(reminder.bookingId);
    } catch (error) {
      console.error("[bot/poller]", error instanceof Error ? error.message : error);
    }
  }
}

export function startReminderPoller(bot: Bot<CafeContext>): void {
  const run = (): void => {
    void tick(bot);
  };
  setTimeout(run, 5_000);
  setInterval(run, TICK_MS);
}
