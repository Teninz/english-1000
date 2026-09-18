// Скриншоты для магазина: локальный Chrome (puppeteer-core, без загрузки браузера), демо-режим приложения,
// 360×640 CSS px при DPR 3 → 1080×1920 PNG в store/screens-9x16/. Нужен запущенный статический сервер (порт 8766).
//   node tools/store-screens.js [home companion thematic card quiz gap road words]
const puppeteer = require("puppeteer-core");
const path = require("path"), fs = require("fs");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE || "http://localhost:8766/index.html";
const OUT = path.join(__dirname, "..", "store", "screens-9x16");
const SCREENS = { home: {}, companion: { wait: 1500 }, thematic: {}, card: { wait: 900 }, quiz: {}, gap: {}, road: {}, words: {} };
(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCREENS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  for (const name of names) {
    const url = `${BASE}?demo=1&screen=${name}&scene=town&theme=dark`;
    await page.goto(url, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, SCREENS[name]?.wait || 600));
    const file = path.join(OUT, `${name}.png`);
    await page.screenshot({ path: file, type: "png" });
    console.log(name, "->", path.relative(process.cwd(), file));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
