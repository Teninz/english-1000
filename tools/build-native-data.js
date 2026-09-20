// Словарь для нативного приложения: native/app/src/main/assets/words.json — [en, ru, pos, ex, exRu]
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; vm.createContext(ctx);
for (const f of ["words-a.js", "words-b.js", "oxford-a1.js", "oxford-a2.js", "oxford-b1.js", "oxford-b2.js", "words-extra.js", "program.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
vm.runInContext("this.out=WORDS.map(w=>[w[0],w[1],w[2],w[3],w[4]||''])", ctx);
const out = path.join(root, "native/app/src/main/assets/words.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(ctx.out));
console.log("words.json:", ctx.out.length, "слов");
