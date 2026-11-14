import { z } from "zod";

/**
 * Адреса доставки + полигон зоны доставки кофейни.
 */

export const addressSchema = z.object({
  title: z.string().min(1).max(50),
  street: z.string().min(1, "Укажите улицу"),
  building: z.string().min(1, "Укажите дом"),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  intercom: z.string().optional(),
  comment: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Доставка бесплатна, если сумма позиций не ниже этого порога (BYN). */
export const FREE_DELIVERY_FROM = 30;

export const deliveryCheckSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type DeliveryCheckInput = z.infer<typeof deliveryCheckSchema>;

/**
 * Полигон зоны доставки (центр Минска, условный).
 * Несколько тарифов и точный контур — когда появится боевой адрес.
 */
export const DELIVERY_ZONE_POLYGON: readonly GeoPoint[] = [
  { lat: 53.921, lng: 27.532 },
  { lat: 53.928, lng: 27.585 },
  { lat: 53.902, lng: 27.612 },
  { lat: 53.882, lng: 27.578 },
  { lat: 53.888, lng: 27.53 },
] as const;

/**
 * Проверка вхождения точки в полигон (ray-casting).
 * Чистая функция — используется на фронте (DeliveryMapModal),
 * в API-роуте создания заказа и в боте при получении геолокации.
 */
export function isPointInDeliveryZone(
  point: GeoPoint,
  polygon: readonly GeoPoint[] = DELIVERY_ZONE_POLYGON,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;

    const intersects =
      pi.lng > point.lng !== pj.lng > point.lng &&
      point.lat < ((pj.lat - pi.lat) * (point.lng - pi.lng)) / (pj.lng - pi.lng) + pi.lat;
    if (intersects) inside = !inside;
  }
  return inside;
}

export interface DeliveryCheckResult {
  inZone: boolean;
  freeFrom: number;
}

export function checkDeliveryPoint(point: GeoPoint): DeliveryCheckResult {
  return {
    inZone: isPointInDeliveryZone(point),
    freeFrom: FREE_DELIVERY_FROM,
  };
}

/** Центр полигона — точка «в зоне», если геолокация недоступна (тест / уточнение курьером). */
export function deliveryZoneCentroid(
  polygon: readonly GeoPoint[] = DELIVERY_ZONE_POLYGON,
): GeoPoint {
  const sum = polygon.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
    { lat: 0, lng: 0 },
  );
  const count = polygon.length || 1;
  return { lat: sum.lat / count, lng: sum.lng / count };
}
