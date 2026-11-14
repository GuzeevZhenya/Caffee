import { MOCK_CATEGORIES, MOCK_MENU_ITEMS, type MenuItem3DConfig } from "@repo/shared";
import type {
  StaffMenuCategory,
  StaffMenuRow,
  StaffNotification,
  StaffOrder,
  StaffShift,
  StaffStockItem,
  StaffUser,
} from "@repo/shared";
import {
  readLocalStore,
  updateLocalStore,
  type LocalExtraMenuItem,
  type LocalGuest,
  type StoredOrder,
} from "./local-store";

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

export function findLocalOrderByNumber(orderNumber: number): StoredOrder | null {
  return readLocalStore().orders.find((order) => order.orderNumber === orderNumber) ?? null;
}

export function upsertLocalGuest(input: LocalGuest): LocalGuest {
  let saved: LocalGuest = input;
  updateLocalStore((data) => {
    const existing = data.guests.find((guest) => guest.telegramId === input.telegramId);
    if (existing) {
      existing.firstName = input.firstName;
      existing.phone = input.phone;
      existing.username = input.username;
      saved = { ...existing };
      return;
    }
    data.guests.push(input);
    saved = input;
  });
  return saved;
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

export function demoMenuCategories(): StaffMenuCategory[] {
  return MOCK_CATEGORIES.map((category) => ({ id: category.id, name: category.name }));
}

export function extraMenuConfigs(): MenuItem3DConfig[] {
  return readLocalStore().extraMenuItems.map(extraToConfig);
}

export function allDemoMenuItems(): MenuItem3DConfig[] {
  return [...MOCK_MENU_ITEMS, ...extraMenuConfigs()].map(applyDemoMenu);
}

export function demoMenuRows(): StaffMenuRow[] {
  return allDemoMenuItems().map(toMenuRow);
}

export function patchDemoMenu(
  id: string,
  patch: {
    name?: string;
    description?: string;
    basePrice?: number;
    isAvailable?: boolean;
    previewImageUrl?: string | null;
  },
): StaffMenuRow | null {
  let found = false;
  updateLocalStore((data) => {
    const extra = data.extraMenuItems.find((item) => item.id === id);
    if (extra) {
      if (patch.name !== undefined) extra.name = patch.name;
      if (patch.description !== undefined) extra.description = patch.description;
      if (patch.basePrice !== undefined) extra.basePrice = patch.basePrice;
      if (patch.isAvailable !== undefined) extra.isAvailable = patch.isAvailable;
      if (patch.previewImageUrl !== undefined) extra.previewImageUrl = patch.previewImageUrl;
      found = true;
      return;
    }
    if (!MOCK_MENU_ITEMS.some((item) => item.id === id)) return;
    const prev = data.menuOverrides[id] ?? {};
    data.menuOverrides[id] = { ...prev, ...patch };
    found = true;
  });
  if (!found) return null;
  const item = allDemoMenuItems().find((row) => row.id === id);
  return item ? toMenuRow(item) : null;
}

export function createDemoMenu(input: {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  isAvailable: boolean;
}): StaffMenuRow {
  const category = MOCK_CATEGORIES.find((row) => row.id === input.categoryId);
  if (!category) throw new Error("unknown_category");
  const extra: LocalExtraMenuItem = {
    id: `local-item-${crypto.randomUUID()}`,
    categoryId: input.categoryId,
    slug: slugFromName(input.name),
    name: input.name,
    description: input.description,
    basePrice: input.basePrice,
    isAvailable: input.isAvailable,
    previewImageUrl: null,
  };
  updateLocalStore((data) => {
    data.extraMenuItems.push(extra);
  });
  return toMenuRow(extraToConfig(extra));
}

/** Гостевое меню видит правки админки, пока нет PostgreSQL. */
export function applyDemoMenu(item: MenuItem3DConfig): MenuItem3DConfig {
  const patch = readLocalStore().menuOverrides[item.id];
  if (!patch) return item;
  return {
    ...item,
    name: patch.name ?? item.name,
    description: patch.description ?? item.description,
    basePrice: patch.basePrice ?? item.basePrice,
    isAvailable: patch.isAvailable ?? item.isAvailable,
    previewImageUrl: patch.previewImageUrl === undefined ? item.previewImageUrl : patch.previewImageUrl,
  };
}

export function slugFromName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "item"}-${Date.now().toString(36)}`;
}

function extraToConfig(item: LocalExtraMenuItem): MenuItem3DConfig {
  return {
    id: item.id,
    categoryId: item.categoryId,
    slug: item.slug,
    name: item.name,
    description: item.description,
    basePrice: item.basePrice,
    baseCalories: 0,
    baseWeightGrams: 0,
    prepTimeMinutes: 5,
    isAvailable: item.isAvailable,
    isFeatured: false,
    modelUrl: null,
    previewImageUrl: item.previewImageUrl,
    cameraPreset: { position: [0, 1.8, 4.5], target: [0, 0.5, 0], fov: 42 },
    scale3D: 1,
    ambientColorHex: "#ffffff",
    layers: [
      {
        id: `${item.id}-base`,
        menuItemId: item.id,
        meshName: "Layer_Base",
        primitiveType: "CYLINDER",
        layerOrder: 0,
        basePositionY: 0,
        explodeOffsetY: 0.5,
        heightScale: 0.2,
        radiusScale: 1,
        labelPosition: [1.2, 0, 0],
        title: "Основа",
        description: null,
        isDefault: true,
        isRemovable: false,
        isOptionalAdd: false,
        priceModifier: 0,
        material: { colorHex: "#6F4E37", opacity: 1, roughness: 0.4 },
        nutrition: { calories: 0, proteins: 0, fats: 0, carbs: 0, weightGrams: 0 },
      },
    ],
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
    categoryId: item.categoryId,
    categoryName: category?.name ?? "Меню",
    description: patch?.description ?? item.description,
    basePrice: patch?.basePrice ?? item.basePrice,
    isAvailable: patch?.isAvailable ?? item.isAvailable,
    previewImageUrl:
      patch?.previewImageUrl === undefined ? item.previewImageUrl : patch.previewImageUrl,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
