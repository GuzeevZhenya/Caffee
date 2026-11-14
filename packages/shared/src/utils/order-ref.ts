export type OrderRef = { id: string } | { number: number };

/**
 * Разбор номера из чата: `1042`, `#1042` или id заказа.
 */
export function parseOrderRef(raw: string): OrderRef | null {
  const text = raw.trim().replace(/^#/, "");
  if (!text) return null;
  if (/^\d{1,8}$/.test(text)) return { number: Number(text) };
  if (/^[a-zA-Z0-9_-]{8,64}$/.test(text)) return { id: text };
  return null;
}
