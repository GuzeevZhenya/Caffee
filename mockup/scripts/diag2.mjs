import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text(), "|", m.location()?.url); });
page.on("requestfailed", (r) => console.log("FAILED:", r.url()));
page.on("response", (r) => { if (r.status() >= 400) console.log("HTTP", r.status(), r.url()); });
await page.goto(`http://localhost:${process.argv[2]}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await browser.close();
