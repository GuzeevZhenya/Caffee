import { z } from "zod";
import { ORDER_STATUSES, ORDER_TYPES } from "../types/realtime.types";
import { STAFF_ROLES } from "./auth.schema";

export const staffOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.number().int(),
  type: z.enum(ORDER_TYPES),
  status: z.enum(ORDER_STATUSES),
  itemsTotal: z.number(),
  finalTotal: z.number(),
  isPaid: z.boolean(),
  guestName: z.string(),
  summary: z.string(),
  createdAt: z.string(),
});

export type StaffOrder = z.infer<typeof staffOrderSchema>;

export const staffOrdersResponseSchema = z.object({
  orders: z.array(staffOrderSchema),
});

export type StaffOrdersResponse = z.infer<typeof staffOrdersResponseSchema>;

export const patchStaffOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type PatchStaffOrderInput = z.infer<typeof patchStaffOrderSchema>;

export const staffMenuRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryName: z.string(),
  basePrice: z.number(),
  isAvailable: z.boolean(),
});

export type StaffMenuRow = z.infer<typeof staffMenuRowSchema>;

export const staffMenuResponseSchema = z.object({
  items: z.array(staffMenuRowSchema),
});

export type StaffMenuResponse = z.infer<typeof staffMenuResponseSchema>;

export const patchStaffMenuSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  basePrice: z.number().positive().max(500).optional(),
  isAvailable: z.boolean().optional(),
});

export type PatchStaffMenuInput = z.infer<typeof patchStaffMenuSchema>;

export const staffRevenueSchema = z.object({
  date: z.string(),
  ordersCount: z.number().int(),
  paidTotal: z.number(),
  unpaidTotal: z.number(),
  cancelledCount: z.number().int(),
});

export type StaffRevenue = z.infer<typeof staffRevenueSchema>;

export const staffEmployeeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  role: z.enum(STAFF_ROLES),
});

export type StaffEmployee = z.infer<typeof staffEmployeeSchema>;

export const staffEmployeesResponseSchema = z.object({
  employees: z.array(staffEmployeeSchema),
});

export type StaffEmployeesResponse = z.infer<typeof staffEmployeesResponseSchema>;

export const createStaffEmployeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1).max(40),
  role: z.enum(STAFF_ROLES),
  password: z.string().min(6).max(72),
});

export type CreateStaffEmployeeInput = z.infer<typeof createStaffEmployeeSchema>;

export const staffShiftSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  role: z.enum(STAFF_ROLES),
  date: z.string(),
  openedAt: z.string(),
  closedAt: z.string().nullable(),
});

export type StaffShift = z.infer<typeof staffShiftSchema>;

export const staffShiftsResponseSchema = z.object({
  date: z.string(),
  shifts: z.array(staffShiftSchema),
});

export type StaffShiftsResponse = z.infer<typeof staffShiftsResponseSchema>;

export const staffShiftActionSchema = z.object({
  action: z.enum(["open", "close"]),
});

export type StaffShiftAction = z.infer<typeof staffShiftActionSchema>;

export const staffStockItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().min(0),
  lowAt: z.number().int().min(0),
});

export type StaffStockItem = z.infer<typeof staffStockItemSchema>;

export const staffStockResponseSchema = z.object({
  items: z.array(staffStockItemSchema),
});

export type StaffStockResponse = z.infer<typeof staffStockResponseSchema>;

export const patchStaffStockSchema = z.object({
  quantity: z.number().int().min(0).max(500),
});

export type PatchStaffStockInput = z.infer<typeof patchStaffStockSchema>;

export const staffNotificationSchema = z.object({
  id: z.string(),
  tone: z.enum(["info", "warn"]),
  text: z.string(),
});

export type StaffNotification = z.infer<typeof staffNotificationSchema>;

export const staffNotificationsResponseSchema = z.object({
  items: z.array(staffNotificationSchema),
});

export type StaffNotificationsResponse = z.infer<typeof staffNotificationsResponseSchema>;
