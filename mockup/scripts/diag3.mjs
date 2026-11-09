import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 375, height: 780 });
await page.goto(`http://localhost:${process.argv[2]}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 100));
  }
});
await page.waitForTimeout(600);
const info = await page.evaluate(() => ({
  scrollH: document.body.scrollHeight,
  winH: window.innerHeight,
  reveals: document.querySelectorAll(".reveal").length,
  isIn: document.querySelectorAll(".reveal.is-in").length,
  tall: [...document.querySelectorAll("section, .pop-grid, .about, .quotes, .cta-banner, .carousel, .showcase")].map((e) => `${e.className?.slice(0, 30) || e.tagName}:${Math.round(e.getBoundingClientRect().height)}`).join(" | "),
}));
console.log(JSON.stringify(info, null, 1));
await browser.close();
