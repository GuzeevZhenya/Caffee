// Верификация макета: консоль, 404, скриншоты, клики по CTA.
// Запускается против локального dev-сервера (порт передаётся аргументом).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = `http://localhost:${process.argv[2] ?? 5199}`;
const SHOTS = ".shots";
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];

async function visit(page, path, name, viewport) {
  const consoleErrors = [];
  const badResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`); });
  await page.setViewportSize(viewport);
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400); // дать 3D отрисоваться
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  return { consoleErrors, badResponses };
}

const desktop = await browser.newPage();

// 1. Лендинг
let r = await visit(desktop, "/index.html", "01-landing", { width: 1440, height: 900 });
if (r.consoleErrors.length) problems.push(`landing console: ${r.consoleErrors.join(" | ")}`);
if (r.badResponses.length) problems.push(`landing http: ${r.badResponses.join(" | ")}`);
// Проскроллить страницу, чтобы reveal-секции проявились, и переснять
await desktop.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((res) => setTimeout(res, 120));
  }
  window.scrollTo(0, 0);
});
await desktop.waitForTimeout(600);
await desktop.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true });
// Клик по главному CTA
await desktop.click("text=Смотреть 3D-меню");
await desktop.waitForURL("**/menu.html");
console.log("CTA menu: OK");

// 2. Меню + фильтр
r = await visit(desktop, "/menu.html", "02-menu", { width: 1440, height: 900 });
if (r.consoleErrors.length) problems.push(`menu console: ${r.consoleErrors.join(" | ")}`);
if (r.badResponses.length) problems.push(`menu http: ${r.badResponses.join(" | ")}`);
await desktop.click("text=Десерты");
await desktop.waitForTimeout(400);
const cards = await desktop.locator(".menu-card").count();
console.log("filter desserts cards:", cards);

// 3. Страница блюда
r = await visit(desktop, "/item.html?id=raf-caramel", "03-item", { width: 1440, height: 900 });
if (r.consoleErrors.length) problems.push(`item console: ${r.consoleErrors.join(" | ")}`);
if (r.badResponses.length) problems.push(`item http: ${r.badResponses.join(" | ")}`);
const pinsVisible = await desktop.locator(".pin.show").count();
console.log("pins visible:", pinsVisible);
// Переключить слой и добавить в корзину
await desktop.locator(".switch").last().click();
await desktop.waitForTimeout(300);
await desktop.click("#add");
await desktop.waitForTimeout(300);
const noteVisible = await desktop.locator("#added.show").count();
console.log("added note:", noteVisible);
// Вечерний режим
await desktop.click('[data-mode="evening"]');
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${SHOTS}/03b-item-evening.png` });

// 4. Бронирование
r = await visit(desktop, "/booking.html", "04-booking", { width: 1440, height: 900 });
if (r.consoleErrors.length) problems.push(`booking console: ${r.consoleErrors.join(" | ")}`);
if (r.badResponses.length) problems.push(`booking http: ${r.badResponses.join(" | ")}`);
// Выбрать свободный стол: ищем первый со статусом free
await desktop.locator(".slot").nth(2).click();
await desktop.waitForTimeout(200);
const nodes = await desktop.locator("#hall .table-node").all();
let held = false;
for (const n of nodes) {
  await n.click();
  await desktop.waitForTimeout(200);
  const btn = await desktop.locator("#hold-btn").count();
  if (btn) {
    await desktop.click("#hold-btn");
    held = true;
    break;
  }
}
console.log("hold created:", held);
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${SHOTS}/04b-booking-hold.png`, fullPage: true });

// 5. Корзина (в localStorage уже есть позиция из шага 3)
r = await visit(desktop, "/checkout.html", "05-checkout", { width: 1440, height: 900 });
if (r.consoleErrors.length) problems.push(`checkout console: ${r.consoleErrors.join(" | ")}`);
if (r.badResponses.length) problems.push(`checkout http: ${r.badResponses.join(" | ")}`);
// Отправка пустой формы → ошибки валидации
await desktop.click("button[type=submit]");
await desktop.waitForTimeout(200);
const errCount = await desktop.locator('.field[data-invalid="true"]').count();
console.log("validation errors shown:", errCount);
// Заполнить и отправить
await desktop.fill("#f-name", "Евгений");
await desktop.fill("#f-phone", "+375291112233");
await desktop.click("button[type=submit]");
await desktop.waitForTimeout(400);
const success = await desktop.locator(".success .order-no").count();
console.log("order success:", success);
await desktop.screenshot({ path: `${SHOTS}/05b-checkout-success.png`, fullPage: true });

// 6. Мобильные вьюпорты (responsive default)
const mobile = await browser.newPage();
let m = await visit(mobile, "/index.html", "06-landing-mobile", { width: 375, height: 760 });
if (m.consoleErrors.length) problems.push(`landing-mobile console: ${m.consoleErrors.join(" | ")}`);
const hScroll = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log("mobile landing h-scroll:", hScroll);
if (hScroll) problems.push("landing mobile: horizontal scroll");
m = await visit(mobile, "/item.html?id=flat-white", "07-item-mobile", { width: 375, height: 760 });
if (m.consoleErrors.length) problems.push(`item-mobile console: ${m.consoleErrors.join(" | ")}`);
const hScroll2 = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log("mobile item h-scroll:", hScroll2);
if (hScroll2) problems.push("item mobile: horizontal scroll");
m = await visit(mobile, "/booking.html", "08-booking-mobile", { width: 375, height: 760 });
const hScroll3 = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log("mobile booking h-scroll:", hScroll3);
if (hScroll3) problems.push("booking mobile: horizontal scroll");

await browser.close();

if (problems.length) {
  console.log("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nALL CHECKS PASSED");
