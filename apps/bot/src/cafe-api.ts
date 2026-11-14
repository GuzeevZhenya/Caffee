import type {
  BotProfileInput,
  BotProfileResponse,
  CreateOrderInput,
  CreateOrderResponse,
  DueBookingReminder,
  MenuResponse,
  OrderStatusResponse,
  TriggerCookingInput,
} from "@repo/shared";

function apiBase(): string {
  return (process.env.API_URL?.trim() || "http://localhost:4000").replace(/\/$/, "");
}

function botSecret(): string {
  return process.env.BOT_API_SECRET?.trim() || process.env.BOT_TOKEN?.trim() || "";
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function botFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  const secret = botSecret();
  if (secret) headers.set("x-bot-secret", secret);
  return fetch(`${apiBase()}${path}`, { ...init, headers });
}

export async function saveBotProfile(input: BotProfileInput): Promise<BotProfileResponse | null> {
  const response = await botFetch("/api/bot/profile", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return readJson<BotProfileResponse>(response);
}

export async function fetchOrderStatus(ref: { id: string } | { number: number }): Promise<OrderStatusResponse | null> {
  const query = "id" in ref ? `id=${encodeURIComponent(ref.id)}` : `number=${ref.number}`;
  const response = await fetch(`${apiBase()}/api/orders?${query}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("order_status_failed");
  return readJson<OrderStatusResponse>(response);
}

export async function triggerCooking(input: TriggerCookingInput): Promise<OrderStatusResponse | null> {
  const response = await fetch(`${apiBase()}/api/orders/trigger`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return readJson<OrderStatusResponse>(response);
}

export async function fetchDueReminders(): Promise<DueBookingReminder[]> {
  const response = await botFetch("/api/bot/due-reminders");
  if (!response.ok) return [];
  const payload = await readJson<{ reminders?: DueBookingReminder[] }>(response);
  return payload.reminders ?? [];
}

export async function ackReminder(bookingId: string): Promise<void> {
  await botFetch("/api/bot/reminders/ack", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function fetchMenu(): Promise<MenuResponse | null> {
  const response = await fetch(`${apiBase()}/api/menu`);
  if (!response.ok) return null;
  return readJson<MenuResponse>(response);
}

export async function createTakeawayOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse | null> {
  const response = await fetch(`${apiBase()}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return readJson<CreateOrderResponse>(response);
}
