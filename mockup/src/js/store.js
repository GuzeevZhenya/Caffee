// Состояние макета: корзина и холды столов в localStorage.
// Холд повторяет контракт Redis-локов: ключ table+slot, TTL 10 минут.

const CART_KEY = "tc_cart";
const HOLD_KEY = "tc_holds";
const ORDER_KEY = "tc_last_order";
export const HOLD_TTL_MS = 10 * 60 * 1000;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("tc:store"));
}

// ---------- Корзина ----------
// item: { itemId, qty, activeLayerIds }
export function getCart() {
  return read(CART_KEY, []);
}
export function addToCart(itemId, activeLayerIds, qty = 1) {
  const cart = getCart();
  const signature = JSON.stringify([...activeLayerIds].sort());
  const existing = cart.find(
    (c) => c.itemId === itemId && JSON.stringify([...c.activeLayerIds].sort()) === signature
  );
  if (existing) existing.qty += qty;
  else cart.push({ itemId, qty, activeLayerIds });
  write(CART_KEY, cart);
}
export function updateQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, qty);
  write(CART_KEY, cart);
}
export function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  write(CART_KEY, cart);
}
export function clearCart() {
  write(CART_KEY, []);
}
export function cartCount() {
  return getCart().reduce((sum, c) => sum + c.qty, 0);
}

// ---------- Холды столов ----------
// hold: { tableId, slotIso, expiresAt }
export function getHolds() {
  const now = Date.now();
  const holds = read(HOLD_KEY, []).filter((h) => h.expiresAt > now);
  if (holds.length !== read(HOLD_KEY, []).length) write(HOLD_KEY, holds);
  return holds;
}
export function holdTable(tableId, slotIso) {
  const holds = getHolds().filter((h) => !(h.tableId === tableId && h.slotIso === slotIso));
  holds.push({ tableId, slotIso, expiresAt: Date.now() + HOLD_TTL_MS });
  write(HOLD_KEY, holds);
}
export function releaseHold(tableId, slotIso) {
  write(HOLD_KEY, getHolds().filter((h) => !(h.tableId === tableId && h.slotIso === slotIso)));
}
export function getMyHold() {
  return getHolds()[0] ?? null;
}

// ---------- Последний заказ ----------
export function saveLastOrder(order) {
  write(ORDER_KEY, order);
}
export function getLastOrder() {
  return read(ORDER_KEY, null);
}
