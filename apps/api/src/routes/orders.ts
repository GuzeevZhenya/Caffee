import { demoStaffAllowed } from "../lib/demo-staff";
import { appendLocalOrder, applyDemoMenu, findLocalOrder, patchLocalOrderTrigger } from "../lib/staff-board";
import { prisma, toMenuItem3DConfig } from "@repo/database";
import {
  calculateItemTotals,
  createOrderSchema,
  MOCK_MENU_ITEMS,
  roundMoney,
  triggerCookingSchema,
  type CreateOrderInput,
  type CreateOrderResponse,
  type OrderStatusResponse,
} from "@repo/shared";
import { Hono } from "hono";

/** Ошибка бизнес-валидации заказа (отличаем от падения БД) */
class OrderValidationError extends Error {}

/**
 * Правила бонусной программы — плейсхолдер до Фазы 5.
 * TODO(Фаза 5): вынести в настройки (админка) и связывать с реальным балансом гостя.
 */
const BONUS_POINT_VALUE = 0.1;
const BONUS_MAX_REDEEM_PERCENT = 0.2;

/** Серверный пересчёт позиций: клиентской цене не доверяем */
function buildOrderLines(
  input: CreateOrderInput,
  configs: Map<string, ReturnType<typeof toMenuItem3DConfig>>,
) {
  return input.items.map((line) => {
    const config = configs.get(line.menuItemId);
    if (!config) {
      throw new OrderValidationError(`Позиция ${line.menuItemId} недоступна`);
    }

    const knownLayerIds = new Set(config.layers.map((layer) => layer.id));
    for (const layerId of line.customConfiguration.activeLayerIds) {
      if (!knownLayerIds.has(layerId)) {
        throw new OrderValidationError(`Слой ${layerId} не принадлежит блюду ${config.slug}`);
      }
    }

    const totals = calculateItemTotals(config, line.customConfiguration.activeLayerIds);
    return {
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      unitPrice: totals.unitPrice,
      totalPrice: roundMoney(totals.unitPrice * line.quantity),
      customConfiguration: line.customConfiguration,
    };
  });
}

function toStatusResponse(order: {
  id: string;
  orderNumber: number;
  status: OrderStatusResponse["status"];
  isPaid: boolean;
  updatedAt: Date;
}): OrderStatusResponse {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    isPaid: order.isPaid,
    updatedAt: order.updatedAt.toISOString(),
  };
}

function saveLocalOrder(input: CreateOrderInput): CreateOrderResponse {
  const configs = new Map(MOCK_MENU_ITEMS.map((item) => [item.id, applyDemoMenu(item)]));
  const lines = buildOrderLines(input, configs);
  const itemsTotal = roundMoney(lines.reduce((sum, line) => sum + line.totalPrice, 0));
  const bonusDiscount = roundMoney(
    Math.min(input.bonusSpent * BONUS_POINT_VALUE, itemsTotal * BONUS_MAX_REDEEM_PERCENT),
  );
  const finalTotal = roundMoney(itemsTotal - bonusDiscount);
  const summary = input.items
    .map((line) => {
      const name = configs.get(line.menuItemId)?.name ?? line.menuItemId;
      return `${name} × ${line.quantity}`;
    })
    .join(", ");
  const order = appendLocalOrder({
    type: input.type,
    status: input.bookingId ? "COOKING_HOLD" : "PENDING",
    itemsTotal,
    finalTotal,
    isPaid: false,
    guestName: "Гость",
    summary,
  });
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    finalTotal: order.finalTotal,
  };
}

export const ordersRoutes = new Hono()
  /**
   * POST /api/orders — создание заказа (Dine-in / Takeaway / Delivery).
   * Цены и КБЖУ пересчитываются на сервере из БД по слепку кастомизации.
   */
  .post("/", async (c) => {
    const parsed = createOrderSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }
    const input = parsed.data;

    try {
      const itemIds = [...new Set(input.items.map((line) => line.menuItemId))];
      const menuRows = await prisma.menuItem.findMany({
        where: { id: { in: itemIds }, isAvailable: true },
        include: { layers: true },
      });
      const configs = new Map(menuRows.map((row) => [row.id, toMenuItem3DConfig(row)]));

      const lines = buildOrderLines(input, configs);
      const itemsTotal = roundMoney(lines.reduce((sum, line) => sum + line.totalPrice, 0));
      const bonusDiscount = roundMoney(
        Math.min(input.bonusSpent * BONUS_POINT_VALUE, itemsTotal * BONUS_MAX_REDEEM_PERCENT),
      );
      const finalTotal = roundMoney(itemsTotal - bonusDiscount);

      // Проверки связанных сущностей
      if (input.bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
        if (!booking) throw new OrderValidationError("Бронь не найдена");
      }
      if (input.addressId) {
        const address = await prisma.address.findUnique({ where: { id: input.addressId } });
        if (!address) throw new OrderValidationError("Адрес не найден");
      }

      // TODO(Фаза 5): реальный пользователь из Telegram initData / сессии сайта.
      // Пока все заказы вешаются на гостевую учётку.
      const guest = await prisma.user.upsert({
        where: { email: "guest@tactile.local" },
        update: {},
        create: { email: "guest@tactile.local", firstName: "Гость" },
      });

      const order = await prisma.order.create({
        data: {
          userId: guest.id,
          type: input.type,
          // Предзаказ к столу ждёт триггера гостя из бота, остальные — оплаты
          status: input.bookingId ? "COOKING_HOLD" : "PENDING",
          bookingId: input.bookingId ?? null,
          addressId: input.addressId ?? null,
          itemsTotal,
          bonusSpent: input.bonusSpent,
          finalTotal,
          items: { create: lines },
        },
      });

      const response: CreateOrderResponse = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        finalTotal: Number(order.finalTotal),
      };
      return c.json(response, 201);
    } catch (error) {
      if (error instanceof OrderValidationError) {
        return c.json({ error: "validation_failed", message: error.message }, 409);
      }
      if (demoStaffAllowed()) {
        try {
          console.warn("[api/orders] БД недоступна, пишу заказ в data/local-store.json");
          return c.json(saveLocalOrder(input), 201);
        } catch (fallback) {
          if (fallback instanceof OrderValidationError) {
            return c.json({ error: "validation_failed", message: fallback.message }, 409);
          }
        }
      }
      console.error("[api/orders] БД недоступна:", error instanceof Error ? error.message : error);
      return c.json({ error: "database_unavailable" }, 503);
    }
  })
  /** GET /api/orders?id=... — статус заказа для live-плашки (поллинг до realtime в Фазе 5) */
  .get("/", async (c) => {
    const orderId = c.req.query("id");
    if (!orderId) {
      return c.json({ error: "missing_id" }, 400);
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, orderNumber: true, status: true, isPaid: true, updatedAt: true },
      });
      if (!order) {
        return c.json({ error: "order_not_found" }, 404);
      }
      return c.json(toStatusResponse(order));
    } catch (error) {
      if (demoStaffAllowed()) {
        const order = findLocalOrder(orderId);
        if (!order) return c.json({ error: "order_not_found" }, 404);
        return c.json(
          toStatusResponse({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            isPaid: order.isPaid,
            updatedAt: new Date(order.updatedAt),
          }),
        );
      }
      console.error("[api/orders] БД недоступна:", error instanceof Error ? error.message : error);
      return c.json({ error: "database_unavailable" }, 503);
    }
  })
  /**
   * PATCH /api/orders/trigger — кнопки из Telegram-бота за 15 минут до брони:
   * [🔥 Готовить сейчас] → COOKING; [⏳ Я опаздываю] → остаётся COOKING_HOLD.
   * TODO(Фаза 5): publish события в realtime-канал orders + пуш на экран бариста.
   */
  .patch("/trigger", async (c) => {
    const parsed = triggerCookingSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    const { orderId, startNow } = parsed.data;

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return c.json({ error: "order_not_found" }, 404);
      }
      if (order.status !== "COOKING_HOLD") {
        return c.json(
          {
            error: "invalid_status",
            message: `Заказ в статусе ${order.status}, триггер недоступен`,
          },
          409,
        );
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: startNow
          ? { isTriggeredByGuest: true, status: "COOKING", scheduledCookTime: new Date() }
          : { isTriggeredByGuest: false },
      });

      return c.json(toStatusResponse(updated));
    } catch (error) {
      if (demoStaffAllowed()) {
        const updated = patchLocalOrderTrigger(orderId, startNow);
        if (updated === "missing") return c.json({ error: "order_not_found" }, 404);
        if (updated === "bad_status") {
          return c.json({ error: "invalid_status", message: "Триггер недоступен для этого статуса" }, 409);
        }
        return c.json(
          toStatusResponse({
            id: updated.id,
            orderNumber: updated.orderNumber,
            status: updated.status,
            isPaid: updated.isPaid,
            updatedAt: new Date(updated.updatedAt),
          }),
        );
      }
      console.error(
        "[api/orders/trigger] БД недоступна:",
        error instanceof Error ? error.message : error,
      );
      return c.json({ error: "database_unavailable" }, 503);
    }
  });
