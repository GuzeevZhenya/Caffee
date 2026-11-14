const STORAGE_KEY = "tactile.last-order";

export interface LastOrderRef {
  orderId: string;
  orderNumber: number;
}

export function readLastOrder(): LastOrderRef | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrderRef;
    if (!parsed.orderId || !parsed.orderNumber) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLastOrder(ref: LastOrderRef): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
  } catch {
    // private mode / quota
  }
}
