import { z } from "zod";

/** Роли персонала (зеркало Prisma Role, без CUSTOMER/COURIER в staff-UI) */
export const STAFF_ROLES = ["ADMIN", "BARISTA"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const staffRoleSchema = z.enum(STAFF_ROLES);

export const loginInputSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const staffUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: staffRoleSchema,
  firstName: z.string().nullable(),
});

export type StaffUser = z.infer<typeof staffUserSchema>;

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: staffUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
