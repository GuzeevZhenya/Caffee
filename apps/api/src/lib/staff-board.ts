import { MOCK_CATEGORIES, MOCK_MENU_ITEMS, type MenuItem3DConfig } from "@repo/shared";
import type {
  StaffMenuRow,
  StaffNotification,
  StaffOrder,
  StaffShift,
  StaffStockItem,
  StaffUser,
} from "@repo/shared";
import { readLocalStore, updateLocalStore, type StoredOrder } from "./local-store";

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function demoOrders(): StaffOrder[] {
  return readLocalStore().orders.map(toPublicOrder);
}

export function findLocalOrder(id: string): StoredOrder | null {
  return readLocalStore().orders.find((order) => order.id === id) ?? null;
}

export function patchDemoOrder(id: string, status: StaffOrder["status"]): StaffOrder | null {
  let result: StaffOrder | null = null;
  updateLocalStore((data) => {
    const order = data.orders.find((item) => item.id === id);
    if (!order) return;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "CANCELLED") order.isPaid = false;
    if (status === "COMPLETED" || status === "READY" || status === "DELIVERING") order.isPaid = true;
    result = toPublicOrder(order);
  });
  return result;
}

export function appendLocalOrder(input: Omit<StaffOrder, "id" | "orderNumber" | "createdAt">): StoredOrder {
  let created: StoredOrder | null = null;
  updateLocalStore((data) => {
    const orderNumber = data.orders.reduce((max, order) => Math.max(max, order.orderNumber), 1000) + 1;
    const now = new Date().toISOString();
    created = {
      ...input,
      id: `local-order-${crypto.randomUUID()}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };
    data.orders.unshift(created);
  });
  if (!created) throw new Error("local order was not saved");
  return created;
}

export function patchLocalOrderTrigger(id: string, startNow: boolean): StoredOrder | "missing" | "bad_status" {
  let result: StoredOrder | "missing" | "bad_status" = "missing";
  updateLocalStore((data) => {
    const order = data.orders.find((item) => item.id === id);
    if (!order) {
      result = "missing";
      return;
    }
    if (order.status !== "COOKING_HOLD") {
      result = "bad_status";
      return;
    }
    if (startNow) order.status = "COOKING";
    order.updatedAt = new Date().toISOString();
    result = { ...order };
  });
  return result;
}

export function demoMenuRows(): StaffMenuRow[] {
  return MOCK_MENU_ITEMS.map(toMenuRow);
}

export function patchDemoMenu(
  id: string,
  patch: { name?: string; basePrice?: number; isAvailable?: boolean },
): StaffMenuRow | null {
  const item = MOCK_MENU_ITEMS.find((row) => row.id === id);
  if (!item) return null;
  updateLocalStore((data) => {
    const prev = data.menuOverrides[id] ?? {};
    data.menuOverrides[id] = { ...prev, ...patch };
  });
  return toMenuRow(item);
}

/** Гостевое меню видит правки админки, пока нет PostgreSQL. */
export function applyDemoMenu(item: MenuItem3DConfig): MenuItem3DConfig {
  const patch = readLocalStore().menuOverrides[item.id];
  if (!patch) return item;
  return {
    ...item,
    name: patch.name ?? item.name,
    basePrice: patch.basePrice ?? item.basePrice,
    isAvailable: patch.isAvailable ?? item.isAvailable,
  };
}

export function demoShifts(date: string): StaffShift[] {
  return readLocalStore()
    .shifts.filter((shift) => shift.date === date)
    .map((shift) => ({ ...shift }));
}

export function openDemoShift(user: StaffUser, date: string): StaffShift | "already_open" {
  let result: StaffShift | "already_open" = "already_open";
  updateLocalStore((data) => {
    const open = data.shifts.find(
      (shift) => shift.userId === user.id && shift.date === date && !shift.closedAt,
    );
    if (open) {
      result = "already_open";
      return;
    }
    const shift: StaffShift = {
      id: `shift-${crypto.randomUUID()}`,
      userId: user.id,
      userName: user.firstName ?? user.email,
      role: user.role,
      date,
      openedAt: new Date().toISOString(),
      closedAt: null,
    };
    data.shifts.push(shift);
    result = { ...shift };
  });
  return result;
}

export function closeDemoShift(user: StaffUser, date: string): StaffShift | "not_open" {
  let result: StaffShift | "not_open" = "not_open";
  updateLocalStore((data) => {
    const open = data.shifts.find(
      (shift) => shift.userId === user.id && shift.date === date && !shift.closedAt,
    );
    if (!open) {
      result = "not_open";
      return;
    }
    open.closedAt = new Date().toISOString();
    result = { ...open };
  });
  return result;
}

export function demoStock(): StaffStockItem[] {
  return readLocalStore().stock.map((item) => ({ ...item }));
}

export function patchDemoStock(id: string, quantity: number): StaffStockItem | null {
  let result: StaffStockItem | null = null;
  updateLocalStore((data) => {
    const item = data.stock.find((row) => row.id === id);
    if (!item) return;
    item.quantity = quantity;
    result = { ...item };
  });
  return result;
}

export function buildStaffNotifications(input: {
  orders: StaffOrder[];
  stock: StaffStockItem[];
  shifts: StaffShift[];
  user: StaffUser;
}): StaffNotification[] {
  const items: StaffNotification[] = [];
  const ownOpen = input.shifts.some((shift) => shift.userId === input.user.id && !shift.closedAt);
  if (!ownOpen) {
    items.push({
      id: "shift-closed",
      tone: "warn",
      text: "Смена не открыта. Откройте её на вкладке смены, прежде чем принимать заказы.",
    });
  }
  for (const order of input.orders) {
    if (order.status === "READY") {
      items.push({
        id: `order-ready-${order.id}`,
        tone: "warn",
        text: `Заказ #${order.orderNumber} готов к выдаче — ${order.guestName}.`,
      });
    }
    if (order.status === "COOKING" || order.status === "COOKING_HOLD") {
      items.push({
        id: `order-cooking-${order.id}`,
        tone: "info",
        text: `Заказ #${order.orderNumber} ещё на баре — ${order.summary}.`,
      });
    }
  }
  for (const item of input.stock) {
    if (item.quantity <= item.lowAt) {
      items.push({
        id: `stock-${item.id}`,
        tone: "warn",
        text: `Мало на складе: ${item.name} — ${item.quantity} шт.`,
      });
    }
  }
  return items;
}

export function revenueFromOrders(ordersOnDate: StaffOrder[], date: string) {
  const active = ordersOnDate.filter((order) => order.status !== "CANCELLED");
  return {
    date,
    ordersCount: active.length,
    paidTotal: round(active.filter((order) => order.isPaid).reduce((sum, order) => sum + order.finalTotal, 0)),
    unpaidTotal: round(
      active.filter((order) => !order.isPaid).reduce((sum, order) => sum + order.finalTotal, 0),
    ),
    cancelledCount: ordersOnDate.length - active.length,
  };
}

function toPublicOrder(order: StoredOrder): StaffOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    type: order.type,
    status: order.status,
    itemsTotal: order.itemsTotal,
    finalTotal: order.finalTotal,
    isPaid: order.isPaid,
    guestName: order.guestName,
    summary: order.summary,
    createdAt: order.createdAt,
  };
}

function toMenuRow(item: MenuItem3DConfig): StaffMenuRow {
  const patch = readLocalStore().menuOverrides[item.id];
  const category = MOCK_CATEGORIES.find((row) => row.id === item.categoryId);
  return {
    id: item.id,
    name: patch?.name ?? item.name,
    categoryName: category?.name ?? "Меню",
    basePrice: patch?.basePrice ?? item.basePrice,
    isAvailable: patch?.isAvailable ?? item.isAvailable,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
