export { formatPrice } from "./format";
export { requestDeliveryPoint } from "./delivery-geo";
export { readLastOrder, writeLastOrder, type LastOrderRef } from "./last-order";
export {
  drinkPhotoUrl,
  drinkLayerOverlays,
  resolveDrinkPresentation,
  type DrinkLayerOverlay,
  type DrinkPresentation,
} from "./drink-image";
export { mockMenuResponse, mockTablesForSlot } from "./data-fallback";
export { safeLoadErrorMessage, safeOrderErrorMessage } from "./safe-error-message";
export { useReveal } from "./useReveal";
export {
  bootTelegramWebApp,
  isTelegramMiniApp,
  telegramGuestName,
  telegramWebApp,
} from "./telegram-webapp";
