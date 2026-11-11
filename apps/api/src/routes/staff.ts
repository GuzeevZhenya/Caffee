import { addDemoStaff, demoStaffAllowed, listDemoStaff } from "../lib/demo-staff";
import { resolveStaffUser } from "../lib/staff-auth";
import {
  buildStaffNotifications,
  closeDemoShift,
  demoMenuRows,
  demoOrders,
  demoShifts,
  demoStock,
  openDemoShift,
  patchDemoMenu,
  patchDemoOrder,
  patchDemoStock,
  revenueFromOrders,
  todayKey,
} from "../lib/staff-board";
import { Prisma, prisma } from "@repo/database";
import {
  createStaffEmployeeSchema,
  patchStaffMenuSchema,
  patchStaffOrderSchema,
  patchStaffStockSchema,
  staffShiftActionSchema,
  type StaffEmployee,
  type StaffMenuRow,
  type StaffOrder,
  type StaffRevenue,
  type StaffRole,
  type StaffUser,
} from "@repo/shared";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import type { Context } from "hono";

const STAFF_BOTH: StaffRole[] = ["ADMIN", "BARISTA"];

async function requireStaff(
  c: Context,
  roles: readonly StaffRole[],
): Promise<StaffUser | Response> {
  const user = await resolveStaffUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (!roles.includes(user.role)) return c.json({ error: "forbidden" }, 403);
  return user;
}

function isStaff(value: StaffUser | Response): value is StaffUser {
  return !(value instanceof Response);
}

function dayRange(date: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const start = new Date(year, month - 1, day);
  if (Number.isNaN(start.getTime()) || start.getDate() !== day) return null;
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
}

async function loadOrders(): Promise<StaffOrder[]> {
  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { firstName: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
    });
    return rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      type: order.type,
      status: order.status,
      itemsTotal: Number(order.itemsTotal),
      finalTotal: Number(order.finalTotal),
      isPaid: order.isPaid,
      guestName: order.user.firstName ?? "Гость",
      summary:
        order.items.map((item) => `${item.menuItem.name} × ${item.quantity}`).join(", ") ||
        "Без позиций",
      createdAt: order.createdAt.toISOString(),
    }));
  } catch (error) {
    if (!demoStaffAllowed()) throw error;
    console.warn("[api/staff/orders] БД недоступна, отдаю демо-заказы");
    return demoOrders();
  }
}

async function loadMenu(): Promise<StaffMenuRow[]> {
  try {
    const rows = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return rows.map((item) => ({
      id: item.id,
      name: item.name,
      categoryName: item.category.name,
      basePrice: Number(item.basePrice),
      isAvailable: item.isAvailable,
    }));
  } catch (error) {
    if (!demoStaffAllowed()) throw error;
    console.warn("[api/staff/menu] БД недоступна, отдаю демо-меню");
    return demoMenuRows();
  }
}

export const staffRoutes = new Hono()
  .get("/orders", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    try {
      return c.json({ orders: await loadOrders() });
    } catch {
      return c.json({ error: "staff_unavailable" }, 503);
    }
  })
  .patch("/orders/:id", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    const parsed = patchStaffOrderSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const id = c.req.param("id");
    try {
      const order = await prisma.order.update({
        where: { id },
        data: { status: parsed.data.status },
        include: {
          user: { select: { firstName: true } },
          items: { include: { menuItem: { select: { name: true } } } },
        },
      });
      const row: StaffOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        type: order.type,
        status: order.status,
        itemsTotal: Number(order.itemsTotal),
        finalTotal: Number(order.finalTotal),
        isPaid: order.isPaid,
        guestName: order.user.firstName ?? "Гость",
        summary: order.items.map((item) => `${item.menuItem.name} × ${item.quantity}`).join(", "),
        createdAt: order.createdAt.toISOString(),
      };
      return c.json(row);
    } catch (error) {
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      const row = patchDemoOrder(id, parsed.data.status);
      if (!row) return c.json({ error: "not_found" }, 404);
      console.warn("[api/staff/orders] БД недоступна, статус сохранён в демо-сессии", error);
      return c.json(row);
    }
  })
  .get("/menu", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    try {
      return c.json({ items: await loadMenu() });
    } catch {
      return c.json({ error: "staff_unavailable" }, 503);
    }
  })
  .patch("/menu/:id", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    const parsed = patchStaffMenuSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const id = c.req.param("id");
    try {
      const item = await prisma.menuItem.update({
        where: { id },
        data: parsed.data,
        include: { category: true },
      });
      const row: StaffMenuRow = {
        id: item.id,
        name: item.name,
        categoryName: item.category.name,
        basePrice: Number(item.basePrice),
        isAvailable: item.isAvailable,
      };
      return c.json(row);
    } catch (error) {
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      const row = patchDemoMenu(id, parsed.data);
      if (!row) return c.json({ error: "not_found" }, 404);
      console.warn("[api/staff/menu] БД недоступна, правка сохранена в демо-сессии", error);
      return c.json(row);
    }
  })
  .get("/revenue", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    const date = c.req.query("date") ?? todayKey();
    const range = dayRange(date);
    if (!range) return c.json({ error: "invalid_date" }, 400);
    try {
      const rows = await loadOrders();
      const onDate = rows.filter((order) => todayKey(new Date(order.createdAt)) === date);
      const revenue: StaffRevenue = revenueFromOrders(onDate, date);
      return c.json(revenue);
    } catch {
      return c.json({ error: "staff_unavailable" }, 503);
    }
  })
  .get("/employees", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    try {
      const rows = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "BARISTA"] }, email: { not: null } },
        orderBy: { firstName: "asc" },
      });
      const employees: StaffEmployee[] = rows.flatMap((user) =>
        user.email
          ? [{ id: user.id, email: user.email, firstName: user.firstName, role: user.role as StaffRole }]
          : [],
      );
      return c.json({ employees });
    } catch (error) {
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      console.warn("[api/staff/employees] БД недоступна, отдаю демо-сотрудников", error);
      return c.json({ employees: listDemoStaff() });
    }
  })
  .post("/employees", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    const parsed = createStaffEmployeeSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const input = parsed.data;
    try {
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          firstName: input.firstName,
          role: input.role,
          passwordHash,
        },
      });
      const employee: StaffEmployee = {
        id: user.id,
        email: user.email ?? input.email.toLowerCase(),
        firstName: user.firstName,
        role: input.role,
      };
      return c.json(employee, 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return c.json({ error: "email_taken" }, 409);
      }
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      const created = addDemoStaff(input);
      if (!created) return c.json({ error: "email_taken" }, 409);
      console.warn("[api/staff/employees] БД недоступна, сотрудник добавлен в демо-сессию");
      return c.json(created, 201);
    }
  })
  .get("/shifts", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    const date = c.req.query("date") ?? todayKey();
    if (!dayRange(date)) return c.json({ error: "invalid_date" }, 400);
    const rows = demoShifts(date);
    const visible = staff.role === "ADMIN" ? rows : rows.filter((shift) => shift.userId === staff.id);
    return c.json({ date, shifts: visible });
  })
  .post("/shifts", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    const parsed = staffShiftActionSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const date = todayKey();
    const result =
      parsed.data.action === "open" ? openDemoShift(staff, date) : closeDemoShift(staff, date);
    if (result === "already_open") return c.json({ error: "shift_already_open" }, 409);
    if (result === "not_open") return c.json({ error: "shift_not_open" }, 409);
    return c.json(result);
  })
  .get("/stock", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    return c.json({ items: demoStock() });
  })
  .patch("/stock/:id", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    const parsed = patchStaffStockSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const item = patchDemoStock(c.req.param("id"), parsed.data.quantity);
    if (!item) return c.json({ error: "not_found" }, 404);
    return c.json(item);
  })
  .get("/notifications", async (c) => {
    const staff = await requireStaff(c, STAFF_BOTH);
    if (!isStaff(staff)) return staff;
    try {
      const date = todayKey();
      const items = buildStaffNotifications({
        orders: await loadOrders(),
        stock: demoStock(),
        shifts: demoShifts(date),
        user: staff,
      });
      return c.json({ items });
    } catch {
      return c.json({ error: "staff_unavailable" }, 503);
    }
  });
