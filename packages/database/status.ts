import { prisma } from "./src/client";

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown";
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***").split("\n")[0] ?? "unknown";
}

async function main(): Promise<void> {
  const [categories, items, tables] = await Promise.all([
    prisma.category.count(),
    prisma.menuItem.count(),
    prisma.cafeTable.count(),
  ]);
  console.log(`database=up categories=${categories} items=${items} tables=${tables}`);
}

main()
  .catch((error: unknown) => {
    console.error(`database=down ${safeError(error)}`);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
