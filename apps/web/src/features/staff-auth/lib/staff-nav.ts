import type { StaffRole } from "@repo/shared";

export interface StaffNavItem {
  to: string;
  label: string;
}

const ADMIN_NAV: StaffNavItem[] = [
  { to: "/staff/orders", label: "Заказы" },
  { to: "/staff/menu", label: "Меню" },
  { to: "/staff/shifts", label: "Смены" },
  { to: "/staff/revenue", label: "Выручка" },
  { to: "/staff/notifications", label: "Уведомления" },
  { to: "/staff/employees", label: "Сотрудники" },
];

const BARISTA_NAV: StaffNavItem[] = [
  { to: "/staff/shift", label: "Смена" },
  { to: "/staff/orders", label: "Заказы" },
  { to: "/staff/stock", label: "Склад" },
  { to: "/staff/notifications", label: "Уведомления" },
];

export function staffNavForRole(role: StaffRole): StaffNavItem[] {
  return role === "ADMIN" ? ADMIN_NAV : BARISTA_NAV;
}

export function staffHomePath(role: StaffRole): string {
  return role === "ADMIN" ? "/staff/orders" : "/staff/shift";
}
