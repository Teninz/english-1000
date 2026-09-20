// «Дополнительный словарь»: слова прежнего курса, которых нет в Oxford 3000 (по слову и части речи).
// Читает words-a.js, words-b.js, ex-ru.js и tools/oxford-3000.json, пишет words-extra.js.
// Блоки — прежние 20 тем; порядок слов внутри темы сохраняется. Запуск: node tools/build-extra-words.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; vm.createContext(ctx);
for (const f of ["words-a.js", "words-b.js", "ex-ru.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const legacy = vm.runInContext("[...WORDS_A,...WORDS_B].map(w=>[w[0],w[1],w[2],w[3],EX_RU[w[0]]||''])", ctx);
const oxford = JSON.parse(fs.readFileSync(path.join(__dirname, "oxford-3000.json"), "utf8"));
const inOxford = new Set(oxford.units.map(u => `${u[0]}|${u[1]}`));
const THEMES = ["Мнение и мышление","Работа и карьера","Бизнес и финансы","Образование и наука","Технологии","Общество и право","Здоровье и медицина","Окружающая среда","Характер и отношения","Общение и аргументация","Путешествия и транспорт","Дом и быт","Еда и кухня","Покупки и услуги","Искусство и медиа","Прилагательные","Глаголы","Фразовые глаголы","Наречия и связки","Абстрактные понятия"];
const blocks = THEMES.map((title, t) => ({
  id: "x-" + String(t + 1).padStart(2, "0"), title,
  words: legacy.slice(t * 50, t * 50 + 50).filter(w => !inOxford.has(`${w[0].toLowerCase()}|${w[2]}`)),
})).filter(b => b.words.length);
const line = w => "[" + w.map(v => JSON.stringify(v)).join(",") + "]";
const out = `// Дополнительный словарь: ${blocks.reduce((n, b) => n + b.words.length, 0)} слов прежнего курса вне Oxford 3000 (слово и часть речи).
// Файл собирается tools/build-extra-words.js из words-a.js, words-b.js, ex-ru.js; вручную не править.
// Формат записи: [слово, перевод, часть речи, пример, перевод примера]
const WORDS_EXTRA = {level:"extra", blocks:[
${blocks.map(b => `{id:${JSON.stringify(b.id)}, title:${JSON.stringify(b.title)}, words:[\n${b.words.map(line).join(",\n")}\n]}`).join(",\n")}
]};
if(typeof module!=="undefined")module.exports=WORDS_EXTRA;
`;
fs.writeFileSync(path.join(root, "words-extra.js"), out);
console.log("words-extra.js:", blocks.length, "блоков,", blocks.reduce((n, b) => n + b.words.length, 0), "слов");
