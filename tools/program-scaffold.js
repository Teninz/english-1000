// Заготовка контента уровня Oxford 3000: единицы уровня с уже вычитанными переводами и примерами,
// найденными в прежнем курсе (words-a/b.js + ex-ru.js) и в базовых словах маршрутов (thematic-data.js).
// Запуск: node tools/program-scaffold.js A1 [--missing|--tsv] > файл
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const level = process.argv[2] || "A1", mode = process.argv[3] || "";
const oxford = JSON.parse(fs.readFileSync(path.join(__dirname, "oxford-3000.json"), "utf8"));
const ctx = {WordLevels:{lookup:()=>null}}; vm.createContext(ctx);
for (const f of ["words-a.js", "words-b.js", "ex-ru.js", "thematic-data.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const legacy = vm.runInContext("[...WORDS_A,...WORDS_B].map(w=>[w[0],w[1],w[2],w[3],EX_RU[w[0]]||''])", ctx);
const thematic = vm.runInContext("Object.values(THEMATIC_WORDS).flat().map(w=>w.slice(0,5))", ctx);
const known = new Map();
for (const w of [...legacy, ...thematic]) { const k = w[0].toLowerCase() + "|" + w[2]; if (!known.has(k)) known.set(k, w); }
const units = oxford.units.filter(u => u[2] === level);
const perPos = {}; for (const u of oxford.units) perPos[u[0] + "|" + u[1]] = (perPos[u[0] + "|" + u[1]] || 0) + 1;
let filled = 0;
for (const [word, pos, , sense] of units) {
  const k = word + "|" + pos, w = known.get(k), ambiguous = perPos[k] > 1;
  if (w) filled++;
  if (mode === "--missing" && w) continue;
  if (mode === "--tsv") console.log([word, pos, ambiguous ? sense : "", w ? w[1] : "", w ? w[3] : "", w ? w[4] : ""].join("\t"));
  else console.log(`${word} ${pos}${ambiguous ? " (" + sense + ")" : ""}${w ? " ✓" : ""}`);
}
console.error(`${level}: ${units.length} единиц, есть контент для ${filled}`);
