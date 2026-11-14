import { z } from "zod";
import { addressSchema } from "./address.schema";
import { ORDER_TYPES } from "../types/realtime.types";

/**
 * Валидация корзины и заказов (Dine-in / Takeaway / Delivery),
 * включая слепок 3D-кастомизации слоёв блюда.
 */

export const orderTypeSchema = z.enum(ORDER_TYPES);

/** Слепок кастомизации: какие слои оставлены/добавлены в 3D-конструкторе */
export const customConfigurationSchema = z.object({
  activeLayerIds: z.array(z.string().min(1)).min(1, "В блюде должен остаться хотя бы один слой"),
  removedTitles: z.array(z.string()).default([]),
  addedTitles: z.array(z.string()).default([]),
});

export type CustomConfigurationInput = z.infer<typeof customConfigurationSchema>;

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  customConfiguration: customConfigurationSchema,
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z
  .object({
    type: orderTypeSchema,
    /** Обязателен для предзаказа к столику (DINE_IN с бронью) */
    bookingId: z.string().optional(),
    /** Уже сохранённый адрес (редко; Mini App шлёт deliveryAddress) */
    addressId: z.string().optional(),
    /** Новый адрес вместе с заказом */
    deliveryAddress: addressSchema.optional(),
    /** Сколько бонусных баллов списать */
    bonusSpent: z.number().int().min(0).default(0),
    items: z.array(orderItemSchema).min(1, "Корзина пуста"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "DELIVERY" && !data.addressId && !data.deliveryAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Для доставки нужно указать адрес",
        path: ["deliveryAddress"],
      });
    }
    if (data.type === "DINE_IN" && !data.bookingId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Для заказа в зале нужна активная бронь столика",
        path: ["bookingId"],
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** PATCH /api/orders/trigger — кнопка «🔥 Готовить сейчас» из бота */
export const triggerCookingSchema = z.object({
  orderId: z.string().min(1),
  /** true — готовить сейчас; false — гость опаздывает, нажмёт у входа */
  startNow: z.boolean(),
});

export type TriggerCookingInput = z.infer<typeof triggerCookingSchema>;
