// Singleton PrismaClient (+ патч сериализации BigInt)
export { prisma } from "./client";

// Типы моделей и enum'ы Prisma (User, MenuItem, BookingStatus, ...)
export * from "@prisma/client";

// Upstash Redis и хелперы блокировок столов
export * from "./redis";

// Мапперы Prisma → shared-типы (Decimal → number, Json → кортежи)
export * from "./mappers";
