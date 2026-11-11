/**
 * Типы пейлоадов для realtime-событий.
 * Каналы Supabase Realtime / WebSockets, на которые подписываются
 * bookingApi (onCacheEntryAdded) на сайте и tracker.service в боте.
 */

/** Статусы стола на 3D-карте зала */
export const TABLE_STATUSES = ["FREE", "HELD", "BOOKED"] as const;
export type TableRealtimeStatus = (typeof TABLE_STATUSES)[number];

/** Типы заказов (зеркало enum OrderType в Prisma) */
export const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

/** Статусы заказа (зеркало enum OrderStatus в Prisma) */
export const ORDER_STATUSES = [
  "PENDING",
  "COOKING_HOLD",
  "COOKING",
  "READY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Ожидает",
  COOKING_HOLD: "Ждёт гостя",
  COOKING: "Готовится",
  READY: "Готов",
  DELIVERING: "В пути",
  COMPLETED: "Выдан",
  CANCELLED: "Отменён",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: "В зале",
  TAKEAWAY: "С собой",
  DELIVERY: "Доставка",
};

/** Статусы брони (зеркало enum BookingStatus в Prisma) */
export const BOOKING_STATUSES = [
  "HELD",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Событие изменения доступности стола для конкретного тайм-слота */
export interface TableStatusPayload {
  tableId: string;
  /** Начало тайм-слота в ISO 8601 — часть ключа лока lock:table:{id}:{slot} */
  slotStart: string;
  status: TableRealtimeStatus;
  /** Кто держит холд (null — если стол освободился) */
  heldByUserId: string | null;
  /** До какого момента действует холд (ISO 8601), для таймера TableHoldTimer */
  heldUntil: string | null;
}

/** События канала "tables" */
export const BOOKING_REALTIME_EVENTS = [
  "TABLE_HELD",
  "TABLE_RELEASED",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
] as const;
export type BookingRealtimeEventType = (typeof BOOKING_REALTIME_EVENTS)[number];

export interface BookingRealtimeEvent {
  type: BookingRealtimeEventType;
  payload: TableStatusPayload;
  /** Метка времени сервера (ISO 8601) */
  at: string;
}

/** Событие смены статуса заказа (канал "orders", live-трекинг в боте) */
export interface OrderStatusRealtimePayload {
  orderId: string;
  orderNumber: number;
  status: OrderStatus;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Столики зала (3D-диорама)
// ---------------------------------------------------------------------------

/** Зоны зала (зеркало enum TableZone в Prisma) */
export const TABLE_ZONES = ["WINDOW", "CENTER", "QUIET", "TERRACE"] as const;
export type TableZone = (typeof TABLE_ZONES)[number];

/** Ракурс камеры при клике на столик на 3D-карте */
export interface TableCameraFocus {
  position: [x: number, y: number, z: number];
  target: [x: number, y: number, z: number];
}

/** Столик кофейни с координатами на 3D-диораме (CafeTable) */
export interface CafeTableConfig {
  id: string;
  number: number;
  title: string;
  seats: number;
  zone: TableZone;
  hasPowerOutlet: boolean;
  minDeposit: number;
  isActive: boolean;
  meshName: string;
  position3D: [x: number, y: number, z: number];
  rotationY: number;
  cameraFocus: TableCameraFocus | null;
}

/** Столик со статусом на конкретный тайм-слот (ответ GET /api/tables) */
export interface TableSlotStatus extends CafeTableConfig {
  status: TableRealtimeStatus;
  /** До какого момента действует чужой/мой холд (ISO 8601) */
  heldUntil: string | null;
  /** Холд принадлежит текущему гостю (по x-guest-id) */
  heldByMe: boolean;
}

/** Ответ POST /api/tables/hold */
export interface HoldTableResponse {
  locked: boolean;
  tableId: string;
  slotStart: string;
  heldUntil: string | null;
  /** Booking.id в БД (статус HELD); null — если только Redis без Prisma */
  bookingId: string | null;
}
