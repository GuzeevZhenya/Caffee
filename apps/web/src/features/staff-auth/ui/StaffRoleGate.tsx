import { useAppSelector } from "@/app/store";
import { staffHomePath } from "../lib/staff-nav";
import { selectStaffUser } from "../model/staffAuthSlice";
import type { StaffRole } from "@repo/shared";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

/** Прячет вкладку, если роль сотрудника её не открывает */
export function StaffRoleGate({ allow, children }: { allow: readonly StaffRole[]; children: ReactNode }) {
  const user = useAppSelector(selectStaffUser);
  if (!user) return null;
  if (!allow.includes(user.role)) return <Navigate to={staffHomePath(user.role)} replace />;
  return children;
}
