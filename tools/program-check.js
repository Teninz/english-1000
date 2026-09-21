// Проверка контента уровня Oxford 3000 против tools/oxford-3000.json: полнота, дубликаты,
// части речи, уточнения значений, примеры, practice и рабочие пары близких слов.
// Запуск: node tools/program-check.js A1 [файл]
// Без файла берётся oxford-<уровень>.js из корня. Выход 1 при ошибках; список недостающих единиц — в stderr.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const level = (process.argv[2] || "A1").toUpperCase(), file = process.argv[3] || path.join(root, `oxford-${level.toLowerCase()}.js`);
const oxford = JSON.parse(fs.readFileSync(path.join(__dirname, "oxford-3000.json"), "utf8"));
const senses = JSON.parse(fs.readFileSync(path.join(__dirname, "oxford-senses.json"), "utf8"));
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "word-forms.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
const data = vm.runInContext(`OXFORD_${level}`, ctx), EXAMPLE_FORMS = vm.runInContext("EXAMPLE_FORMS", ctx);
function wordRegex(word){
  if(EXAMPLE_FORMS[word]) return new RegExp("(?<![\\p{L}])" + EXAMPLE_FORMS[word].replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?![\\p{L}])","iu");
  const parts = word.split(" ").map(p => p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  let stem = parts[0]; const raw = word.split(" ")[0];
  if(/[^aeiou]y$/i.test(raw)) stem = stem.slice(0,-1)+"(y|ie|i)"; else if(/e$/i.test(raw)) stem = stem.slice(0,-1)+"e?";
  const first = stem + "(s|es|ed|d|ing|er|est)?";
  return new RegExp("\\b" + [first, ...parts.slice(1)].join("\\s+") + "\\b", "i");
}
const perPos = {}; for (const u of oxford.units) (perPos[u[0] + "|" + u[1]] = perPos[u[0] + "|" + u[1]] || []).push(u);
const expected = new Map(); // ключ программы → единица Oxford этого уровня
for (const u of oxford.units.filter(u => u[2] === level)) {
  const base = u[0] + "|" + u[1], ambiguous = perPos[base].length > 1;
  const key = ambiguous ? base + "|" + (senses[base + "|" + u[3]] || (() => { throw Error(`Нет короткого ярлыка значения для ${base}|${u[3]} в tools/oxford-senses.json`); })()) : base;
  expected.set(key, u);
}
const errors = [], seen = new Set();
const blockIds = new Set();
for (const block of data.blocks) {
  if (!block.id || !block.title || !Array.isArray(block.words)) errors.push(`Блок без id/title/words: ${JSON.stringify(block).slice(0, 60)}`);
  if (blockIds.has(block.id)) errors.push(`Повтор id блока ${block.id}`); blockIds.add(block.id);
  if (block.words.length < 12 || block.words.length > 30) errors.push(`Блок ${block.id}: ${block.words.length} слов (нужно 12–30)`);
  for (const w of block.words) {
    if (!Array.isArray(w) || w.length < 5 || w.length > 6 || w.slice(0, 5).some(x => typeof x !== "string" || !x.trim())) { errors.push(`Блок ${block.id}: неполная запись ${JSON.stringify(w)}`); continue; }
    const key = w[0] + "|" + w[2] + (w[5] ? "|" + w[5] : "");
    if (seen.has(key)) errors.push(`Повтор ${key}`); seen.add(key);
    if (!expected.has(key)) errors.push(`Блок ${block.id}: ${key} нет в Oxford 3000 уровня ${level}` + (perPos[w[0] + "|" + w[2]] ? ` (в списке: ${perPos[w[0] + "|" + w[2]].map(u => u[2] + (u[3] ? " " + u[3] : "")).join(", ")})` : ""));
    if (!wordRegex(w[0]).test(w[3])) errors.push(`Блок ${block.id}: слово «${w[0]}» не найдено в примере «${w[3]}»`);
    if (!/^[A-Z“"‘']/.test(w[3]) || !/[.!?”"]$/.test(w[3])) errors.push(`Блок ${block.id}: пример «${w[3]}» не похож на предложение`);
    if (!/[А-ЯЁ«"]/.test(w[4][0]) || !/[.!?»"]$/.test(w[4])) errors.push(`Блок ${block.id}: перевод примера «${w[4]}» не похож на предложение`);
    if (!/[а-яё]/i.test(w[1])) errors.push(`Блок ${block.id}: перевод «${w[1]}» не на русском`);
  }
}
for (const [key, extras] of Object.entries(data.practice || {})) {
  if (!seen.has(key)) errors.push(`practice: ключ ${key} не найден среди слов уровня`);
  for (const field of ["examples", "collocations"]) {
    if (extras[field] !== undefined && !Array.isArray(extras[field])) errors.push(`practice ${key}: ${field} должно быть массивом`);
    const phrases = new Set();
    for (const item of extras[field] || []) {
      if (!Array.isArray(item) || item.length !== 2 || item.some(x => typeof x !== "string" || !x.trim())) { errors.push(`practice ${key}: неполная запись ${field} ${JSON.stringify(item)}`); continue; }
      const [en, ru] = item, normalized = en.toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
      if (!wordRegex(key.split("|")[0]).test(en)) errors.push(`practice ${key}: слово не найдено в ${field === "examples" ? "примере" : "сочетании"} «${en}»`);
      if (!/[а-яё]/i.test(ru)) errors.push(`practice ${key}: перевод «${ru}» не на русском`);
      if (phrases.has(normalized)) errors.push(`practice ${key}: повтор ${field} «${en}»`);
      phrases.add(normalized);
      if (field === "examples" && (!/^[A-Z“"‘']/.test(en) || !/[.!?”"]$/.test(en) || !/[А-ЯЁ«"]/.test(ru[0]) || !/[.!?»"]$/.test(ru))) errors.push(`practice ${key}: пара «${en}» / «${ru}» не похожа на предложения`);
    }
  }
}
const validProgramKeys = new Set();
for (const u of oxford.units) {
  const base = u[0] + "|" + u[1], ambiguous = perPos[base].length > 1;
  validProgramKeys.add(ambiguous ? base + "|" + senses[base + "|" + u[3]] : base);
}
const extraFile = path.join(root, "words-extra.js");
if (fs.existsSync(extraFile)) {
  const extraCtx = {}; vm.createContext(extraCtx); vm.runInContext(fs.readFileSync(extraFile, "utf8"), extraCtx);
  const extra = vm.runInContext("WORDS_EXTRA", extraCtx);
  for (const block of extra.blocks || []) for (const w of block.words || []) validProgramKeys.add(w[0] + "|" + w[2] + (w[5] ? "|" + w[5] : ""));
}
const seenPairs = new Set();
for (const pair of data.confusables || []) {
  if (!Array.isArray(pair) || pair.length !== 2 || pair.some(k => typeof k !== "string")) { errors.push(`confusables: ${JSON.stringify(pair)}`); continue; }
  if (pair[0] === pair[1]) errors.push(`confusables: слово сравнивается само с собой ${pair[0]}`);
  for (const key of pair) if (!validProgramKeys.has(key)) errors.push(`confusables: ключ ${key} отсутствует в программе`);
  const pairKey = pair.slice().sort().join(" ↔ ");
  if (seenPairs.has(pairKey)) errors.push(`confusables: повтор пары ${pairKey}`);
  seenPairs.add(pairKey);
}
const missing = [...expected.keys()].filter(k => !seen.has(k));
console.log(`${level}: ${seen.size}/${expected.size} единиц, ${data.blocks.length} блоков, ошибок ${errors.length}, не хватает ${missing.length}`);
for (const e of errors) console.log("  " + e);
if (missing.length) console.error(missing.join("\n"));
process.exit(errors.length ? 1 : 0);
