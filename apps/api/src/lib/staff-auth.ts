import { demoStaffAllowed, demoStaffByEmail } from "./demo-staff";
import { prisma } from "@repo/database";
import { STAFF_ROLES, type StaffRole, type StaffUser } from "@repo/shared";
import type { Context } from "hono";
import jwt from "jsonwebtoken";

const JWT_TTL = "7d";

export interface StaffJwtPayload {
  sub: string;
  role: StaffRole;
  email: string;
}

function jwtSecret(): string {
  return process.env.JWT_SECRET ?? "tactile-dev-jwt-secret-change-me";
}

export function signStaffToken(user: StaffUser): string {
  const payload: StaffJwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, jwtSecret(), { expiresIn: JWT_TTL });
}

export function verifyStaffToken(token: string): StaffJwtPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret());
    if (typeof decoded !== "object" || decoded === null) return null;
    const sub = "sub" in decoded ? String(decoded.sub) : "";
    const role = "role" in decoded ? String(decoded.role) : "";
    const email = "email" in decoded ? String(decoded.email) : "";
    if (!sub || !email || !(STAFF_ROLES as readonly string[]).includes(role)) return null;
    return { sub, role: role as StaffRole, email };
  } catch {
    return null;
  }
}

export function bearerToken(c: Context): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function resolveStaffUser(c: Context): Promise<StaffUser | null> {
  const token = bearerToken(c);
  if (!token) return null;
  const payload = verifyStaffToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.email || !user.passwordHash) return null;
    if (!(STAFF_ROLES as readonly string[]).includes(user.role)) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role as StaffRole,
      firstName: user.firstName,
    };
  } catch (error) {
    if (!demoStaffAllowed()) return null;
    console.warn(
      "[api/auth/me] БД недоступна, проверяю демо-сессию:",
      error instanceof Error ? error.message : error,
    );
    const demo = demoStaffByEmail(payload.email);
    if (!demo || demo.id !== payload.sub || demo.role !== payload.role) return null;
    return demo;
  }
}
