/** Публичный HTTPS URL сайта. Telegram Mini App не открывает http://localhost. */
export function webappOrigin(): string | undefined {
  const url = process.env.WEBAPP_URL?.trim().replace(/\/$/, "");
  return url || undefined;
}

export function miniAppUrl(): string | undefined {
  const origin = webappOrigin();
  if (!origin?.startsWith("https://")) return undefined;
  if (origin.includes("your-app.vercel.app") || origin.includes("...")) return undefined;
  return `${origin}/tma`;
}
