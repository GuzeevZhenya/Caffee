import { Bot } from "grammy";

/**
 * Фаза 1 — smoke-скелет бота: проверяет, что workspace apps/bot собирается
 * и запускается. Полноценные сценарии (меню, conversations, Redis-сессии,
 * напоминания за 15 минут до брони) появятся в Фазе 5.
 */

const token = process.env.BOT_TOKEN;

if (!token) {
  console.warn(
    "⚠️  BOT_TOKEN не задан — бот не запущен. Это нормально для Фазы 1: " +
      "скопируйте .env.example в apps/bot/.env и укажите токен.",
  );
  process.exit(0);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Привет! Это Tactile Craft Coffee & Bakery ☕️\n" +
      "Бот находится в разработке — 3D-меню и бронирование появятся совсем скоро.",
  );
});

bot.catch((error) => {
  console.error("❌ Ошибка бота:", error);
});

void bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 Бот @${botInfo.username} запущен (long polling)`);
  },
});
