import { z } from "zod";
import { guestPhoneSchema } from "./booking.schema";

/** Telegram user id строкой: JSON не держит bigint. */
export const telegramIdSchema = z
  .string()
  .trim()
  .regex(/^\d{3,20}$/, "Некорректный Telegram id");

export const botProfileSchema = z.object({
  telegramId: telegramIdSchema,
  firstName: z.string().trim().min(1, "Укажите имя").max(80),
  phone: guestPhoneSchema,
  username: z.string().trim().min(1).max(32).optional(),
});

export type BotProfileInput = z.infer<typeof botProfileSchema>;

export const reminderAckSchema = z.object({
  bookingId: z.string().min(1),
});

export type ReminderAckInput = z.infer<typeof reminderAckSchema>;

/** Нормализация контакта Telegram к +цифры. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) return raw.trim();
  return `+${digits}`;
}
