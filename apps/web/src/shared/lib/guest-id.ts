/**
 * Анонимный ID гостя для локов столов и корзины до появления авторизации.
 * Живёт в localStorage; на сервер уходит заголовком x-guest-id.
 * TODO(Фаза 4/5): заменить на реальную авторизацию (Telegram WebApp initData).
 */

const GUEST_ID_KEY = "tactile-guest-id";

export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  let guestId = window.localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    window.localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}
