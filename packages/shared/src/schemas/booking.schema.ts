import { z } from "zod";

/**
 * Валидация бронирования столов.
 * Используется в API-роуте /api/tables/hold, в форме бронирования
 * на фронте и в сценарии брони Telegram-бота.
 */

/** Минимальная и максимальная длительность брони */
export const BOOKING_MIN_DURATION_MINUTES = 30;
export const BOOKING_MAX_DURATION_MINUTES = 240;

/** Базовые поля брони без проверок (ZodObject — на нём доступен .extend) */
const bookingBaseSchema = z.object({
  tableId: z.string().min(1, "Не выбран столик"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  guestsCount: z.number().int().min(1).max(12).default(2),
});

/**
 * Общие проверки тайм-слота. Выносим в функцию, потому что после .refine()
 * схема становится ZodEffects и теряет .extend() — поэтому проверки
 * применяются последним шагом к каждой схеме отдельно.
 */
function validateTimeSlot(data: { startTime: Date; endTime: Date }, ctx: z.RefinementCtx): void {
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Время окончания должно быть позже времени начала",
      path: ["endTime"],
    });
    return;
  }

  const durationMinutes = (data.endTime.getTime() - data.startTime.getTime()) / 60_000;
  if (
    durationMinutes < BOOKING_MIN_DURATION_MINUTES ||
    durationMinutes > BOOKING_MAX_DURATION_MINUTES
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Бронь — от ${BOOKING_MIN_DURATION_MINUTES} минут до ${BOOKING_MAX_DURATION_MINUTES / 60} часов`,
      path: ["endTime"],
    });
  }

  if (data.startTime.getTime() <= Date.now()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Нельзя забронировать столик в прошлом",
      path: ["startTime"],
    });
  }
}

export const holdTableSchema = bookingBaseSchema.superRefine(validateTimeSlot);

export type HoldTableInput = z.infer<typeof holdTableSchema>;

/** Полное создание брони (после холда, с пожеланиями гостя) */
export const createBookingSchema = bookingBaseSchema
  .extend({
    specialRequests: z.string().max(500, "Максимум 500 символов").optional(),
  })
  .superRefine(validateTimeSlot);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Query-параметры GET /api/tables — статусы столов на выбранный слот */
export const tableSlotQuerySchema = z.object({
  /** Дата визита, YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат даты: YYYY-MM-DD"),
  /** Начало слота, HH:mm */
  slot: z.string().regex(/^\d{2}:\d{2}$/, "Формат времени: HH:mm"),
  guestsCount: z.coerce.number().int().min(1).max(12).optional(),
  /** Фильтр «Нужна розетка» (для работы с ноутбуком) */
  hasPowerOutlet: z.coerce.boolean().optional(),
});

export type TableSlotQuery = z.infer<typeof tableSlotQuerySchema>;
