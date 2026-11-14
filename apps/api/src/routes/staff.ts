import { addDemoStaff, demoStaffAllowed, listDemoStaff } from "../lib/demo-staff";
import { resolveStaffUser } from "../lib/staff-auth";
import {
  buildStaffNotifications,
  closeDemoShift,
  createDemoMenu,
  demoMenuCategories,
  demoMenuRows,
  demoOrders,
  demoShifts,
  demoStock,
  openDemoShift,
  patchDemoMenu,
  patchDemoOrder,
  patchDemoStock,
  revenueFromOrders,
  slugFromName,
  todayKey,
} from "../lib/staff-board";
import { saveMenuPhoto } from "../lib/menu-photo";
import { Prisma, prisma } from "@repo/database";
import {
  createStaffEmployeeSchema,
  createStaffMenuSchema,
  patchStaffMenuSchema,
  patchStaffOrderSchema,
  patchStaffStockSchema,
  staffShiftActionSchema,
  type StaffEmployee,
  type StaffMenuResponse,
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

function toStaffMenuRow(item: {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: { name: string };
  basePrice: { toString(): string } | number;
  isAvailable: boolean;
  previewImageUrl: string | null;
}): StaffMenuRow {
  return {
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    categoryName: item.category.name,
    description: item.description,
    basePrice: Number(item.basePrice),
    isAvailable: item.isAvailable,
    previewImageUrl: item.previewImageUrl,
  };
}

async function loadMenu(): Promise<StaffMenuResponse> {
  try {
    const [rows, categories] = await Promise.all([
      prisma.menuItem.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return {
      items: rows.map(toStaffMenuRow),
      categories: categories.map((category) => ({ id: category.id, name: category.name })),
    };
  } catch (error) {
    if (!demoStaffAllowed()) throw error;
    console.warn("[api/staff/menu] БД недоступна, отдаю демо-меню");
    return { items: demoMenuRows(), categories: demoMenuCategories() };
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
      return c.json(await loadMenu());
    } catch {
      return c.json({ error: "staff_unavailable" }, 503);
    }
  })
  .post("/menu", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    const parsed = createStaffMenuSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: "invalid_body" }, 400);
    const input = parsed.data;
    try {
      const item = await prisma.menuItem.create({
        data: {
          categoryId: input.categoryId,
          slug: slugFromName(input.name),
          name: input.name,
          description: input.description,
          basePrice: input.basePrice,
          isAvailable: input.isAvailable,
          layers: {
            create: {
              meshName: "Layer_Base",
              primitiveType: "CYLINDER",
              layerOrder: 0,
              title: "Основа",
              isDefault: true,
              isRemovable: false,
            },
          },
        },
        include: { category: true },
      });
      return c.json(toStaffMenuRow(item), 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return c.json({ error: "unknown_category" }, 400);
      }
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      try {
        const row = createDemoMenu(input);
        console.warn("[api/staff/menu] БД недоступна, позиция сохранена в демо-сессии", error);
        return c.json(row, 201);
      } catch (demoError) {
        if (demoError instanceof Error && demoError.message === "unknown_category") {
          return c.json({ error: "unknown_category" }, 400);
        }
        throw demoError;
      }
    }
  })
  .post("/menu/:id/photo", async (c) => {
    const staff = await requireStaff(c, ["ADMIN"]);
    if (!isStaff(staff)) return staff;
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    const file = body.file;
    if (!(file instanceof File)) return c.json({ error: "invalid_body" }, 400);
    let previewImageUrl: string;
    try {
      previewImageUrl = await saveMenuPhoto(id, file);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "too_large" || code === "unsupported_type") {
        return c.json({ error: code }, 400);
      }
      throw error;
    }
    try {
      const item = await prisma.menuItem.update({
        where: { id },
        data: { previewImageUrl },
        include: { category: true },
      });
      return c.json(toStaffMenuRow(item));
    } catch (error) {
      if (!demoStaffAllowed()) return c.json({ error: "staff_unavailable" }, 503);
      const row = patchDemoMenu(id, { previewImageUrl });
      if (!row) return c.json({ error: "not_found" }, 404);
      console.warn("[api/staff/menu] БД недоступна, фото сохранено в демо-сессии", error);
      return c.json(row);
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
      return c.json(toStaffMenuRow(item));
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
