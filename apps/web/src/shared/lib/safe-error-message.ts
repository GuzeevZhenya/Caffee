import type { ApiErrorResponse } from "@repo/shared";

const GENERIC_ORDER_ERROR = "Не удалось оформить заказ. Попробуйте ещё раз.";
const GENERIC_LOAD_ERROR = "Данные временно недоступны. Показали демо-версию.";

function isProd(): boolean {
  return import.meta.env.PROD;
}

/**
 * Сообщение об ошибке заказа для UI.
 * В production не отдаём коды/сырой текст API — только нейтральную фразу.
 */
export function safeOrderErrorMessage(error: unknown): string {
  if (isProd()) return GENERIC_ORDER_ERROR;

  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: ApiErrorResponse }).data;
    if (data?.message) return data.message;
    if (data?.error === "database_unavailable") {
      return "База данных недоступна — заполните .env и поднимите Supabase.";
    }
    if (data?.error) return data.error;
  }
  return GENERIC_ORDER_ERROR;
}

/** Нейтральный текст, если даже клиентский фолбэк не сработал. */
export function safeLoadErrorMessage(): string {
  return isProd() ? GENERIC_LOAD_ERROR : "Не удалось загрузить данные. Проверьте, что запущен apps/api.";
}
