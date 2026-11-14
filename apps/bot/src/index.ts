import "./load-env";
import { Bot, session } from "grammy";
import { emptySession, type CafeContext } from "./context";
import { onCallback, onMenu, onMessage, onStart, onStatus, onZone } from "./handlers";
import { showCart } from "./shop";
import { startReminderPoller } from "./poller";
import { miniAppUrl } from "./webapp";

const token = process.env.BOT_TOKEN?.trim() ?? "";
const tokenReady = /^\d{6,}:[A-Za-z0-9_-]{20,}$/.test(token) && !token.includes("...");

if (!tokenReady) {
  console.warn(
    "BOT_TOKEN пустой или шаблонный. Вставьте токен от @BotFather в корневой .env — сайт и API можно не останавливать.",
  );
  await new Promise(() => undefined);
}

const bot = new Bot<CafeContext>(token);

bot.use(
  session({
    initial: emptySession,
  }),
);

bot.command("start", onStart);
bot.command("help", onStart);
bot.command("menu", onMenu);
bot.command("cart", showCart);
bot.command("zone", onZone);
bot.command("status", onStatus);
bot.on("callback_query:data", onCallback);
bot.on("message", onMessage);

bot.catch((error) => {
  console.error("Ошибка бота:", error.message);
});

startReminderPoller(bot);

try {
  const appUrl = miniAppUrl();
  if (appUrl) {
    await bot.api.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Меню",
        web_app: { url: appUrl },
      },
    });
    console.log(`Mini App: ${appUrl}`);
  } else {
    await bot.api.setChatMenuButton({ menu_button: { type: "commands" } });
    console.warn(
      "WEBAPP_URL без боевого https — кнопка «Приложение» не ставится. Нужен туннель или Vercel, не localhost и не шаблон your-app.vercel.app.",
    );
  }
  await bot.start({
    onStart: (info) => {
      console.log(`Бот @${info.username} запущен`);
    },
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Бот не стартовал:", message);
  console.error("Проверьте BOT_TOKEN в корневом .env — токен берётся у @BotFather.");
  await new Promise(() => undefined);
}
