import { baseApi } from "@/shared/api/baseApi";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  OrderStatusResponse,
  TriggerCookingInput,
} from "@repo/shared";

/**
 * Заказы: создание (Dine-in / Takeaway / Delivery), трекинг статуса
 * и триггер «🔥 Готовить сейчас» из Telegram-бота.
 */
export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<CreateOrderResponse, CreateOrderInput>({
      query: (body) => ({ url: "orders", method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),

    getOrderStatus: build.query<OrderStatusResponse, string>({
      query: (orderId) => ({ url: "orders", params: { id: orderId } }),
      providesTags: (_result, _error, orderId) => [{ type: "Orders" as const, id: orderId }],
    }),

    /** Кнопка из бота: начать готовку предзаказа или отложить до прихода гостя */
    triggerCooking: build.mutation<OrderStatusResponse, TriggerCookingInput>({
      query: (body) => ({ url: "orders/trigger", method: "PATCH", body }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Orders" as const, id: arg.orderId }],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateOrderMutation, useGetOrderStatusQuery, useTriggerCookingMutation } =
  orderApi;
