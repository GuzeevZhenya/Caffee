import { PrismaClient } from "@prisma/client";

const raw = process.env.DIRECT_URL?.trim() ?? "";
const parsed = new URL(raw.replace(/^postgres(?:ql)?:/i, "http:"));
const user = decodeURIComponent(parsed.username);
const password = decodeURIComponent(parsed.password);
const db = parsed.pathname.replace(/^\//, "") || "postgres";
const rebuilt = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${parsed.host}/${db}?sslmode=require`;

const prisma = new PrismaClient({
  datasources: { db: { url: rebuilt } },
  log: ["error"],
});

prisma
  .$queryRaw`SELECT 1 AS ok`
  .then(() => {
    console.log("prisma-auth=ok");
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? (error.message.split("\n")[0] ?? "unknown") : "unknown";
    const safe = message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***");
    console.error(`prisma-auth=fail ${safe}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
