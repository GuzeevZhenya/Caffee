import type { OrderStatus, OrderStatusRealtimePayload } from "./realtime.types";

/**
 * Контракты ответов HTTP API (apps/api ↔ apps/web через RTK Query).
 * Ошибки возвращаются как { error: string, ... } с соответствующим HTTP-кодом.
 */

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: number;
  status: OrderStatus;
  finalTotal: number;
}

export interface BotProfileResponse {
  telegramId: string;
  firstName: string;
  phone: string;
}

export interface DueBookingReminder {
  bookingId: string;
  telegramId: string;
  firstName: string | null;
  startTime: string;
  orders: Array<{ orderId: string; orderNumber: number }>;
}

/** Статус заказа для live-плашки (поллинг до realtime в Фазе 5) */
export interface OrderStatusResponse extends OrderStatusRealtimePayload {
  isPaid: boolean;
}

/** Унифицированная форма ошибки API */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  issues?: unknown;
}
