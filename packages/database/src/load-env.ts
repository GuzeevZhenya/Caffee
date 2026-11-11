import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Корень монорепо: packages/database/src → ../../..
 * Prisma CLI этот файл не исполняет — для db:push есть scripts/run-with-root-env.mjs.
 */
const envFile = resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env");

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}
