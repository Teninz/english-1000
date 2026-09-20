// Программа основного раздела: Oxford 3000 по уровням A1–B2 и «Дополнительный словарь».
// Подключается после oxford-*.js и words-extra.js. Ключ прогресса — слово и часть речи
// («bank|n»), для значений, которые Oxford разделяет, — ещё и уточнение («bank|n|river»).
// Формат записи блока: [слово, перевод, часть речи, пример, перевод примера, уточнение?]
const PROGRAM_LEVELS = [
  {id:"A1", title:"A1", name:"Начальный", data:typeof OXFORD_A1!=="undefined"?OXFORD_A1:{blocks:[]}, total:1076},
  {id:"A2", title:"A2", name:"Элементарный", data:typeof OXFORD_A2!=="undefined"?OXFORD_A2:{blocks:[]}, total:992},
  {id:"B1", title:"B1", name:"Средний", data:typeof OXFORD_B1!=="undefined"?OXFORD_B1:{blocks:[]}, total:907},
  {id:"B2", title:"B2", name:"Выше среднего", data:typeof OXFORD_B2!=="undefined"?OXFORD_B2:{blocks:[]}, total:835},
  {id:"extra", title:"Доп.", name:"Дополнительный словарь", data:typeof WORDS_EXTRA!=="undefined"?WORDS_EXTRA:{blocks:[]}, total:null},
];
const PROGRAM_TOTAL = 3810; // единиц Oxford 3000 (слово + часть речи), tools/oxford-3000.json
const wordKey = w => w[0] + "|" + w[2] + (w[5] ? "|" + w[5] : "");
const WORDS = [], BLOCKS = [], WORD_KEYS = [], WORD_BLOCK = [], PRACTICE = {};
PROGRAM_LEVELS.forEach((level, levelIdx) => {
  level.blocks = [];
  for (const src of level.data.blocks || []) {
    const block = {id:src.id, title:src.title, level:level.id, levelIdx, n:level.blocks.length+1, start:WORDS.length, ids:[]};
    for (const w of src.words) { block.ids.push(WORDS.length); WORD_BLOCK.push(BLOCKS.length); WORD_KEYS.push(wordKey(w)); WORDS.push(w); }
    BLOCKS.push(block); level.blocks.push(block);
  }
  Object.assign(PRACTICE, level.data.practice || {});
});
const KEY_INDEX = Object.fromEntries(WORD_KEYS.map((k, i) => [k, i]));
const blockOf = i => BLOCKS[WORD_BLOCK[i]];
const levelOf = i => blockOf(i).levelIdx;
const LEVEL_OF_BLOCK = b => PROGRAM_LEVELS[b.levelIdx];
// Прежний курс хранил прогресс по слову без части речи; отсюда одноразовый перенос ключей (v2 → v3).
// Ни одно слово прежнего курса не попадает в значения, разделённые Oxford, поэтому уточнение не нужно.
const LEGACY_KEYS = (typeof WORDS_A === "undefined" || typeof WORDS_B === "undefined") ? {} : Object.fromEntries([...WORDS_A, ...WORDS_B].map(w => [w[0], w[0] + "|" + w[2]]));
// Близкие значения: пары слов, которые путают; задание «выбери нужное» появляется, когда оба начаты.
const CONFUSABLES = PROGRAM_LEVELS.flatMap(L => L.data.confusables || []).filter(pair => pair.every(k => k in KEY_INDEX));
const CONFUSABLE_OF = {};
for (const pair of CONFUSABLES) for (const k of pair) (CONFUSABLE_OF[k] = CONFUSABLE_OF[k] || []).push(...pair.filter(x => x !== k));
if (typeof module !== "undefined") module.exports = {PROGRAM_LEVELS, PROGRAM_TOTAL, WORDS, BLOCKS, WORD_KEYS, KEY_INDEX, PRACTICE, CONFUSABLES, CONFUSABLE_OF, LEGACY_KEYS, wordKey, blockOf, levelOf};
