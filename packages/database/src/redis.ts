import { Redis } from "@upstash/redis";

/**
 * Клиент Upstash Redis + хелперы временных блокировок столов.
 *
 * Ключ лока: lock:table:{tableId}:{slotStartIso}
 * TTL: 10 минут — гость должен успеть оплатить бронь, иначе стол освобождается
 * автоматически по истечении TTL (не нужен фоновый джоб для очистки).
 */

export const TABLE_LOCK_TTL_SECONDS = 600;

export interface TableLock {
  tableId: string;
  slotStart: string;
  userId: string;
  /** ISO 8601 — момент, когда холд истечёт (для TableHoldTimer на фронте) */
  expiresAt: string;
}

/** Ленивая инициализация: падаем с понятной ошибкой только при реальном вызове */
let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN не заданы в окружении");
    }
    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

export function tableLockKey(tableId: string, slotStartIso: string): string {
  return `lock:table:${tableId}:${slotStartIso}`;
}

/**
 * Атомарный захват стола (SET NX EX).
 * @returns true — лок получен; false — стол уже держит другой гость.
 */
export async function lockTable(
  tableId: string,
  slotStartIso: string,
  userId: string,
  ttlSeconds: number = TABLE_LOCK_TTL_SECONDS,
): Promise<boolean> {
  const lock: TableLock = {
    tableId,
    slotStart: slotStartIso,
    userId,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };
  const result = await getRedis().set<TableLock>(tableLockKey(tableId, slotStartIso), lock, {
    nx: true,
    ex: ttlSeconds,
  });
  return result === "OK";
}

/**
 * Снятие лока. Удаляем ключ только если он принадлежит этому пользователю —
 * иначе по истечении TTL один гость мог бы снять свежий лок другого.
 */
export async function unlockTable(
  tableId: string,
  slotStartIso: string,
  userId: string,
): Promise<boolean> {
  const redis = getRedis();
  const key = tableLockKey(tableId, slotStartIso);
  const existing = await redis.get<TableLock>(key);
  if (!existing || existing.userId !== userId) return false;
  return (await redis.del(key)) === 1;
}

/** Кто держит стол на слоте (null — стол свободен) */
export async function getTableLock(
  tableId: string,
  slotStartIso: string,
): Promise<TableLock | null> {
  return getRedis().get<TableLock>(tableLockKey(tableId, slotStartIso));
}

/**
 * Локи всех столов зала на один тайм-слот одним round-trip'ом (pipeline mget).
 * Используется GET /api/tables для раскраски 3D-карты.
 */
export async function getTableLocks(
  tableIds: readonly string[],
  slotStartIso: string,
): Promise<Record<string, TableLock>> {
  if (tableIds.length === 0) return {};
  const redis = getRedis();
  const keys = tableIds.map((id) => tableLockKey(id, slotStartIso));
  const values = await redis.mget<(TableLock | null)[]>(...keys);

  const locks: Record<string, TableLock> = {};
  values.forEach((value, index) => {
    const tableId = tableIds[index];
    if (value && tableId) locks[tableId] = value;
  });
  return locks;
}
