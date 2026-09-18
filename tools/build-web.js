// Собирает веб-часть в dist/ для упаковки в Capacitor и генерирует словарь для виджета.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist, { recursive: true });

const files = ["index.html", "learning-core.js", "word-forms.js", "progress-storage.js", "fox-motion.js", "journey.js", "companion.css", "thematic.css", "thematic.js", "words-a.js", "words-b.js", "ex-ru.js", "thematic-data.js", "scenes.js", "tts.js", "ach.js", "daily.js", "about.js", "native.js", "manifest.json", "privacy.html"];
const dirs = ["icons", "art", "lib"];
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(dist, f));
for (const d of dirs) fs.cpSync(path.join(root, d), path.join(dist, d), {
  recursive: true,
  // Исходные PNG-кадры нужны только для пересборки APNG и не должны попадать в APK.
  // Референсы, исходные клипы и пробы фона живут в art/, но в APK не нужны.
  // Клипы лисы (.webm) в APK не входят: приложение скачивает их с GitHub Releases по кнопке (native.js, foxPackStore).
  filter: src => !["companion-anim-frames", "companion", "companion-anim", "companion-references", "Visual", "Фон"].includes(path.basename(src)) && !/^Фон.*\.png$/u.test(path.basename(src)) && !(src.includes("companion-v2") && src.endsWith(".webm")), // companion-probe/probe.webm остаётся: он нужен диагностике
});

// внутри APK service worker не нужен: файлы и так локальные
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
html = html.replace('if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }', "");
fs.writeFileSync(path.join(dist, "index.html"), html);

// словарь для виджета «Слово дня»: [слово, перевод, пример, перевод примера, уровень]
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "words-a.js"), "utf8") + fs.readFileSync(path.join(root, "words-b.js"), "utf8") + fs.readFileSync(path.join(root, "ex-ru.js"), "utf8") + ";this.out=[...WORDS_A,...WORDS_B].map((w,i)=>[w[0],w[1],w[3],EX_RU[w[0]]||'',Math.floor(i/50)+1])", ctx);
fs.writeFileSync(path.join(dist, "widget-words.json"), JSON.stringify(ctx.out));
console.log("dist готов:", fs.readdirSync(dist).length, "элементов, слов для виджета:", ctx.out.length);
