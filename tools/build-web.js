// Собирает веб-часть в dist/ для упаковки в Capacitor и генерирует словарь для виджета.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist, { recursive: true });

const files = ["index.html", "learning-core.js", "score-core.js", "word-forms.js", "progress-storage.js", "journey.js", "motivation.css", "thematic.css", "thematic.js", "competition.css", "competition-config.js", "competition.js", "words-a.js", "words-b.js", "ex-ru.js", "thematic-data.js", "word-levels.js", "oxford-a1.js", "oxford-a2.js", "oxford-b1.js", "oxford-b2.js", "words-extra.js", "program.js", "scenes.js", "tts.js", "ach.js", "daily.js", "about.js", "native.js", "manifest.json", "privacy.html"];
const dirs = ["icons", "art", "lib"];
// Среда выполнения Piper (wasm ORT и словарь произношения) — 33 МБ, и нужна она только тем,
// кто включит встроенные голоса. В установщик не едет: приложение скачивает её по кнопке
// в настройках голосов с сайта проекта. Загрузчик lib/piper.js остаётся, он лёгкий.
const skipLib = ["lib/ort", "lib/piper_phonemize.data", "lib/piper_phonemize.wasm"];
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(dist, f));
for (const d of dirs) fs.cpSync(path.join(root, d), path.join(dist, d), {
  recursive: true,
  // Исходники в приложение не входят: ни кадры живых фонов, ни мастера сцен, ни превью ассетов.
  // Из art/scenes едут только WebP-уровни, собранные tools/build-scene-mips.py.
  filter: src => {
    const name = path.basename(src), rel = path.relative(root, src).split(path.sep).join("/");
    if (["Visual", "Фон"].includes(name) || /^Фон.*\.png$/u.test(name)) return false;
    // в art/scenes из файлов едут только уровни вида <вариант>-<слой>-<ширина>.webp,
    // мастера лежат там же без суффикса ширины и в приложение не нужны
    if (rel.startsWith("art/scenes/") && !fs.statSync(src).isDirectory() && !/-\d+\.webp$/u.test(name)) return false;
    if (skipLib.some(p => rel === p || rel.startsWith(p + "/"))) return false;
    return !["art/ui/preview.html", "art/ui/README.md"].includes(rel);
  },
});

// внутри APK service worker не нужен: файлы и так локальные
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
html = html.replace('if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }', "");
fs.writeFileSync(path.join(dist, "index.html"), html);

// словарь для виджета «Слово дня»: [слово, перевод, пример, перевод примера, уровень и блок]
const ctx = {}; vm.createContext(ctx);
for (const f of ["words-a.js", "words-b.js", "oxford-a1.js", "oxford-a2.js", "oxford-b1.js", "oxford-b2.js", "words-extra.js", "program.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
vm.runInContext("this.out=WORDS.map((w,i)=>[w[0],w[1],w[3],w[4]||'',PROGRAM_LEVELS[blockOf(i).levelIdx].title+' · '+blockOf(i).title])", ctx);
fs.writeFileSync(path.join(dist, "widget-words.json"), JSON.stringify(ctx.out));
console.log("dist готов:", fs.readdirSync(dist).length, "элементов, слов для виджета:", ctx.out.length);
