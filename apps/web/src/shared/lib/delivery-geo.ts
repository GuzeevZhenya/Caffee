import type { GeoPoint } from "@repo/shared";

/** Геоточка для проверки зоны доставки (браузер или WebView Telegram). */
export function requestDeliveryPoint(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация недоступна"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        reject(new Error("Не удалось определить место"));
      },
      { enableHighAccuracy: true, timeout: 8_000, maximumAge: 30_000 },
    );
  });
}
