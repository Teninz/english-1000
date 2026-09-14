// Словарь для нативного приложения: native/app/src/main/assets/words.json — [en, ru, pos, ex, exRu]
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "words-a.js"), "utf8") + fs.readFileSync(path.join(root, "words-b.js"), "utf8") + fs.readFileSync(path.join(root, "ex-ru.js"), "utf8") + ";this.out=[...WORDS_A,...WORDS_B].map(w=>[w[0],w[1],w[2],w[3],EX_RU[w[0]]||''])", ctx);
const out = path.join(root, "native/app/src/main/assets/words.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(ctx.out));
console.log("words.json:", ctx.out.length, "слов");
