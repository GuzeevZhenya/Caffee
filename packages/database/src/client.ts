import "./load-env";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton-инстанс PrismaClient.
 * В dev-режиме Next.js пересоздаёт модули на каждый hot-reload —
 * без кэша в globalThis это плодит соединения с PostgreSQL до таймаута пулера.
 */

declare global {
  var __prismaClient: PrismaClient | undefined;
}

// Патч сериализации BigInt: User.telegramId — BigInt, а JSON.stringify
// падает на bigint. Отдаём telegramId строкой в API-ответах.
interface BigIntPrototypePatch {
  toJSON?: () => string;
}
const bigIntProto = BigInt.prototype as unknown as BigIntPrototypePatch;
if (typeof bigIntProto.toJSON !== "function") {
  bigIntProto.toJSON = function (this: bigint): string {
    return this.toString();
  };
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalThis.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = prisma;
}
