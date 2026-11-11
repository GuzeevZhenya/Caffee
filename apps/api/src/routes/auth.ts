import { resolveStaffUser, signStaffToken } from "../lib/staff-auth";
import { prisma } from "@repo/database";
import {
  loginInputSchema,
  STAFF_ROLES,
  type LoginResponse,
  type StaffRole,
  type StaffUser,
} from "@repo/shared";
import bcrypt from "bcryptjs";
import { Hono } from "hono";

export const authRoutes = new Hono()
  /**
   * POST /api/auth/login — email + пароль → JWT + StaffUser
   */
  .post("/login", async (c) => {
    const parsed = loginInputSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    }

    const { email, password } = parsed.data;

    try {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user?.passwordHash || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
        return c.json({ error: "invalid_credentials" }, 401);
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok || !user.email) {
        return c.json({ error: "invalid_credentials" }, 401);
      }

      const staff: StaffUser = {
        id: user.id,
        email: user.email,
        role: user.role as StaffRole,
        firstName: user.firstName,
      };
      const response: LoginResponse = {
        token: signStaffToken(staff),
        user: staff,
      };
      return c.json(response);
    } catch (error) {
      console.error("[api/auth/login]", error instanceof Error ? error.message : error);
      return c.json({ error: "auth_unavailable" }, 503);
    }
  })
  /**
   * GET /api/auth/me — текущий сотрудник по Bearer JWT
   */
  .get("/me", async (c) => {
    const staff = await resolveStaffUser(c);
    if (!staff) return c.json({ error: "unauthorized" }, 401);
    return c.json(staff);
  });
