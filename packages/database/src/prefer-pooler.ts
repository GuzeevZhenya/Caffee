/**
 * Transaction pooler (:6543) часто закрыт файрволом.
 * Session pooler на том же хосте (:5432) с этой сети открыт — Prisma ходит туда.
 * Файл .env не перезаписываем: только process.env текущего процесса.
 */
export function preferReachablePooler(env: NodeJS.ProcessEnv = process.env): void {
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const directUrl = env.DIRECT_URL?.trim() ?? "";

  if (/:6543\b/.test(databaseUrl) && /:5432\b/.test(directUrl)) {
    env.DATABASE_URL = withSsl(directUrl);
  } else {
    env.DATABASE_URL = withSsl(databaseUrl) || env.DATABASE_URL;
  }

  if (directUrl) {
    env.DIRECT_URL = withSsl(directUrl);
  }
}

function withSsl(url: string): string {
  if (!url || /[?&]sslmode=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}
