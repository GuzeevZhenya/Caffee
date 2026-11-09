// Проверка новой главной: сцена, swap карусели, адаптив.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = `http://localhost:${process.argv[2] ?? 5199}`;
const SHOTS = ".shots";
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];
const page = await browser.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
page.on("response", (r) => { if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.url()}`); });

// ---------- Desktop 1440 ----------
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${SHOTS}/10-hero-desktop.png` });

const title1 = await page.locator(".current-pick h2").textContent();
console.log("center drink:", title1);

// Клик по 4-й миниатюре → swap
await page.locator(".car-item").nth(3).click();
await page.waitForTimeout(900);
const title2 = await page.locator(".current-pick h2").textContent();
console.log("after swap:", title2);
if (title1 === title2) problems.push("carousel swap did not change center drink");
await page.screenshot({ path: `${SHOTS}/11-hero-swapped.png` });

// Клик по центральной миниатюре → переход на item.html
await page.locator(".car-item").nth(2).click();
await page.waitForURL("**/item.html?id=*", { timeout: 5000 });
console.log("center click navigates:", page.url());
await page.goBack();
await page.waitForTimeout(800);

// Проскроллить и снять всю страницу
await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 110));
  }
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOTS}/12-landing-full.png`, fullPage: true });

// ---------- Tablet 834 ----------
await page.setViewportSize({ width: 834, height: 1112 });
await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${SHOTS}/13-hero-tablet.png`, fullPage: false });
const hScrollT = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log("tablet h-scroll:", hScrollT);
if (hScrollT) problems.push("tablet: horizontal scroll");

// ---------- Mobile 375 ----------
await page.setViewportSize({ width: 375, height: 780 });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${SHOTS}/14-hero-mobile.png`, fullPage: false });
const hScrollM = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log("mobile h-scroll:", hScrollM);
if (hScrollM) problems.push("mobile: horizontal scroll");
await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 100));
  }
});
await page.screenshot({ path: `${SHOTS}/15-landing-mobile-full.png`, fullPage: true });

await browser.close();

if (consoleErrors.length) problems.push("console: " + consoleErrors.join(" | "));
if (problems.length) {
  console.log("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nLANDING CHECKS PASSED");
