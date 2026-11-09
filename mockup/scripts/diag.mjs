import { chromium } from "playwright";
const BASE = `http://localhost:${process.argv[2] ?? 5199}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
page.on("response", (r) => { if (r.status() >= 400) console.log("404:", r.url()); });
await page.setViewportSize({ width: 375, height: 760 });
for (const path of ["/index.html", "/item.html?id=flat-white", "/booking.html"]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const wide = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        out.push(`${el.tagName}.${String(el.className).slice(0, 60)} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
      }
    }
    return out.slice(0, 12);
  });
  console.log(path, "->", wide);
}
await browser.close();
