/** Текст ошибки без строки подключения. */
export function databaseErrorText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***");
}

/** Настоящая строка Postgres, а не пустой шаблон из .env.example. */
export function databaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) return false;
  if (url.includes("[PROJECT-REF]") || url.includes("[PASSWORD]")) return false;
  return true;
}
