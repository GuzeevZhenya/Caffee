import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StaffOrder, StaffShift, StaffStockItem } from "@repo/shared";

export interface LocalStaffAccount {
  id: string;
  email: string;
  password: string;
  role: "ADMIN" | "BARISTA";
  firstName: string;
}

export interface MenuOverride {
  name?: string;
  basePrice?: number;
  isAvailable?: boolean;
}

export interface StoredOrder extends StaffOrder {
  updatedAt: string;
}

export interface LocalStoreData {
  version: 1;
  orders: StoredOrder[];
  menuOverrides: Record<string, MenuOverride>;
  shifts: StaffShift[];
  stock: StaffStockItem[];
  staff: LocalStaffAccount[];
}

const FILE = fileURLToPath(new URL("../../../../data/local-store.json", import.meta.url));

let state: LocalStoreData | null = null;

export function localStorePath(): string {
  return FILE;
}

export function readLocalStore(): LocalStoreData {
  if (state) return state;
  try {
    const parsed: unknown = JSON.parse(readFileSync(FILE, "utf8"));
    if (!isStore(parsed)) throw new Error("bad shape");
    state = parsed;
  } catch (error) {
    const missing = error instanceof Error && "code" in error && error.code === "ENOENT";
    if (!missing) {
      console.warn("[local-store] файл не прочитан, создаю новый:", FILE);
    }
    state = seedStore();
    persist();
  }
  return state;
}

export function updateLocalStore(mutate: (data: LocalStoreData) => void): void {
  const data = readLocalStore();
  mutate(data);
  persist();
}

function persist(): void {
  if (!state) return;
  mkdirSync(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  renameSync(tmp, FILE);
}

function isStore(value: unknown): value is LocalStoreData {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === 1 &&
    Array.isArray(record.orders) &&
    Array.isArray(record.shifts) &&
    Array.isArray(record.stock) &&
    Array.isArray(record.staff) &&
    typeof record.menuOverrides === "object" &&
    record.menuOverrides !== null
  );
}

function seedStore(): LocalStoreData {
  const now = Date.now();
  const at = (minutesAgo: number): string => new Date(now - minutesAgo * 60_000).toISOString();
  const order = (
    partial: Omit<StoredOrder, "updatedAt" | "createdAt"> & { minutesAgo: number },
  ): StoredOrder => {
    const { minutesAgo, ...rest } = partial;
    const createdAt = at(minutesAgo);
    return { ...rest, createdAt, updatedAt: createdAt };
  };
  return {
    version: 1,
    orders: [
      order({
        id: "demo-order-1042",
        orderNumber: 1042,
        type: "DINE_IN",
        status: "COOKING",
        itemsTotal: 11.7,
        finalTotal: 11.7,
        isPaid: true,
        guestName: "Анна",
        summary: "Латте Классический, Миндальный круассан",
        minutesAgo: 25,
      }),
      order({
        id: "demo-order-1043",
        orderNumber: 1043,
        type: "TAKEAWAY",
        status: "READY",
        itemsTotal: 9.2,
        finalTotal: 9.2,
        isPaid: true,
        guestName: "Илья",
        summary: "Чизкейк «Ягодный слой»",
        minutesAgo: 12,
      }),
      order({
        id: "demo-order-1044",
        orderNumber: 1044,
        type: "DELIVERY",
        status: "PENDING",
        itemsTotal: 24.3,
        finalTotal: 24.3,
        isPaid: false,
        guestName: "Мария",
        summary: "Раф «Солёная карамель», Круассан с лососем",
        minutesAgo: 4,
      }),
    ],
    menuOverrides: {},
    shifts: [],
    stock: [
      { id: "stock-croissant", name: "Миндальный круассан", quantity: 6, lowAt: 4 },
      { id: "stock-cheesecake", name: "Чизкейк «Ягодный слой»", quantity: 2, lowAt: 3 },
      { id: "stock-salmon", name: "Круассан с лососем", quantity: 8, lowAt: 3 },
    ],
    staff: [
      {
        id: "demo-admin",
        email: "admin@tactile.local",
        password: "admin123",
        role: "ADMIN",
        firstName: "Админ",
      },
      {
        id: "demo-barista",
        email: "barista@tactile.local",
        password: "barista123",
        role: "BARISTA",
        firstName: "Бариста",
      },
    ],
  };
}
