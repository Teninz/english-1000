// Задания дня: три задания на день — новые слова, повторение и одно из режимов проверки.
// Любое задание можно один раз заменить; голосовые заменяются на задания без микрофона.
// Состояние в S.daily = { d, tasks:[...], log:{ learn, review, heard, pronOk, sessions:[...] } }.
const DAILY_POOL = {
  mc:     { title:"Выбор перевода",      desc:"10 вопросов, не меньше 80%",        icon:"mc",    mode:"mc",     min:.8 },
  rev:    { title:"Обратный выбор",      desc:"10 вопросов, не меньше 80%",        icon:"rev",   mode:"rev",    min:.8 },
  type:   { title:"Написание",           desc:"10 слов, не меньше 70%",            icon:"type",  mode:"type",   min:.7 },
  listen: { title:"На слух",             desc:"10 вопросов, не меньше 80%",        icon:"sound", mode:"listen", min:.8 },
  gap:    { title:"Пропуск в предложении", desc:"10 вопросов, не меньше 80%",      icon:"gap",   mode:"gap",    min:.8 },
  pairs:  { title:"Пары",                desc:"Пройти два раунда пар",             icon:"pairs", mode:"pairs",  min:0 },
  exam:   { title:"Экзамен",             desc:"20 вопросов, не меньше 70%",        icon:"exam",  mode:"exam",   min:.7 },
  pron:   { title:"Произношение",        desc:"5 слов узнаны с микрофона",         icon:"mic",   voice:true, count:5 },
  roadL:  { title:"В дороге: слушать",   desc:"Прослушать 15 слов",                icon:"road",  heard:15 },
  roadA:  { title:"В дороге: отвечать",  desc:"10 ответов голосом",                icon:"mic",   voice:true, roadAnswers:10 },
};
const DAILY_MODE_KEYS = ["mc","rev","type","listen","gap","pairs","exam","pron","roadL","roadA"];
function dailyHash(str){ let h = 2166136261; for(const c of str){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function dailyEnsure(){
  const d = today();
  if(S.daily && S.daily.d === d) return S.daily;
  const due = dueList().length, un = unstartedList().length;
  const h = dailyHash(d);
  const modeKey = DAILY_MODE_KEYS[h % DAILY_MODE_KEYS.length];
  const tasks = [];
  if(un > 0) tasks.push({ id:"learn", target: Math.min(S.goal, un) });
  else tasks.push({ id:"hard", target: 1 }); // весь словарь начат — тренировка по сложным
  if(due > 0) tasks.push({ id:"review", target: Math.min(due, 15) });
  else tasks.push({ id:"level", level: (h >>> 4) % 20, target: 1 });
  tasks.push({ id:"mode", key: modeKey });
  S.daily = { d, tasks: tasks.map(t => Object.assign({ swapped:false, done:false }, t)), log:{ learn:0, review:0, heard:0, pronOk:0, roadAnswers:0, sessions:[] } };
  save(); return S.daily;
}
function dailyEvent(ev, p = {}){
  const D = dailyEnsure(); const L = D.log;
  if(ev === "learn") L.learn++;
  if(ev === "review") L.review++;
  if(ev === "heard") L.heard++;
  if(ev === "pronOk") L.pronOk++;
  if(ev === "session"){ const n = p.res.length, ok = p.res.filter(x=>x.ok).length; L.sessions.push({ mode:p.mode, n, pct: n ? ok/n : 0, road: !!p.road }); if(p.road) L.roadAnswers += n; }
  dailyRefresh();
}
function dailyProgress(t){
  const L = dailyEnsure().log;
  if(t.id === "learn") return [L.learn, t.target];
  if(t.id === "review") return [Math.min(L.review, t.target), t.target];
  if(t.id === "level") return [L.sessions.some(s => s.mode !== "review" && s.mode !== "learn" && s.n >= 10 && s.pct >= .8) ? 1 : 0, 1];
  if(t.id === "hard") return [L.sessions.some(s => s.n >= 4 && s.pct >= .8) ? 1 : 0, 1];
  const m = DAILY_POOL[t.key];
  if(m.count) return [Math.min(L.pronOk, m.count), m.count];
  if(m.heard) return [Math.min(L.heard, m.heard), m.heard];
  if(m.roadAnswers) return [Math.min(L.roadAnswers, m.roadAnswers), m.roadAnswers];
  if(m.mode === "pairs") return [Math.min(L.sessions.filter(s => s.mode === "pairs").length, 2), 2];
  return [L.sessions.some(s => s.mode === m.mode && s.pct >= m.min && s.n >= (m.mode === "exam" ? 20 : 10)) ? 1 : 0, 1];
}
function dailyRefresh(){
  const D = dailyEnsure(); let changed = false;
  D.tasks.forEach(t => { const [p, tg] = dailyProgress(t); if(!t.done && p >= tg){ t.done = true; changed = true; } });
  if(changed){ save(); if(D.tasks.every(t => t.done)){ S.stats = S.stats || {}; S.stats.dailyDone = S.stats.dailyDone || {}; S.stats.dailyDone[D.d] = 1; const n = Object.keys(S.stats.dailyDone).length; if(typeof unlock === "function"){ unlock("daily1"); if(n >= 7) unlock("daily7"); } save(); toast("Задания дня выполнены"); } else if(typeof toast === "function") toast("Задание выполнено"); }
  if(tab === "home" && $("#dailyCard")) { const c = $("#dailyCard"); c.outerHTML = dailyCardHtml(); wireDaily(); }
}
function dailyTitle(t){
  if(t.id === "learn") return ["Выучить новые слова", `${t.target} ${plural(t.target,"слово","слова","слов").replace(/^\d+ /,"")} из текущего уровня`, "learn"];
  if(t.id === "review") return ["Повторить слова", `${t.target} из очереди на сегодня`, "rev"];
  if(t.id === "level") return ["Проверка по уровню", `${t.level+1}. ${LEVEL_NAMES[t.level]} — любой режим, 10 вопросов на 80%`, "test"];
  if(t.id === "hard") return ["Сложные слова", "Любая проверка по сложным на 80%", "flag"];
  const m = DAILY_POOL[t.key]; return [m.title, m.desc, m.icon];
}
function dailyStart(t){
  if(t.id === "learn"){ go("learn"); return; }
  if(t.id === "review"){ dueList().length ? startReview() : go("home"); return; }
  if(t.id === "level"){ testScope = "level"; testLevel = t.level; go("test"); return; }
  if(t.id === "hard"){ testScope = "hard"; go("test"); return; }
  const m = DAILY_POOL[t.key];
  if(m.heard || m.roadAnswers){ hfMode = m.heard ? "listen" : "ru"; go("road"); return; }
  if(m.count){ testScope = dueList().length >= 4 ? "due" : "all"; if(startedList().length < 4) testScope = "level"; go("test"); setTimeout(() => launchTest("pron"), 50); return; }
  testScope = dueList().length >= 4 ? "due" : (startedList().length >= 4 ? "all" : "level"); go("test"); setTimeout(() => launchTest(m.mode), 50);
}
// замена: голосовое → без микрофона; остальные — на другой режим из пула, один раз
function dailySwap(idx){
  const D = dailyEnsure(); const t = D.tasks[idx]; if(t.swapped || t.done) return;
  const used = new Set(D.tasks.map(x => x.key).filter(Boolean));
  const wasVoice = t.id === "mode" && DAILY_POOL[t.key].voice;
  const pool = DAILY_MODE_KEYS.filter(k => !used.has(k) && !DAILY_POOL[k].voice && (!canSpeak() ? !["listen","roadL"].includes(k) : true));
  const key = pool[(dailyHash(D.d + idx) + D.tasks.length) % pool.length];
  D.tasks[idx] = { id:"mode", key, swapped:true, done:false };
  save(); toast(wasVoice ? "Заменено на задание без микрофона" : "Задание заменено");
  if(tab === "home"){ $("#dailyCard").outerHTML = dailyCardHtml(); wireDaily(); }
}
function dailyCardHtml(){
  const D = dailyEnsure(); const doneN = D.tasks.filter(t => t.done).length;
  const rows = D.tasks.map((t, i) => { const [title, desc, icon] = dailyTitle(t); const [p, tg] = dailyProgress(t); const voice = t.id === "mode" && DAILY_POOL[t.key].voice;
    return `<div class="dtask ${t.done?"done":""}">
      <span class="dt-ic">${t.done ? ICONS.test : (ICONS[icon] || ICONS.test)}</span>
      <div class="grow" style="min-width:0"><b>${esc(title)}</b><div class="small muted">${esc(desc)}${voice?" · <span style='color:var(--warn)'>нужен микрофон</span>":""}</div>
        <div class="bar" style="height:5px;margin-top:6px"><i style="width:${tg?Math.round(p/tg*100):0}%"></i></div></div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex:none">
        ${t.done ? `<span class="chip good">готово</span>` : `<button class="btn small" data-dstart="${i}">${tg > 1 ? p + "/" + tg : "Начать"}</button>`}
        ${(!t.done && !t.swapped) ? `<button class="btn ghost small" data-dswap="${i}" title="Заменить задание" style="padding:2px 6px;min-height:26px;font-size:12px">⇄ заменить</button>` : ""}
      </div></div>`; }).join("");
  return `<section class="card" id="dailyCard"><div class="row between"><div class="eyebrow">Задания дня</div><span class="small muted num">${doneN} / ${D.tasks.length}</span></div>
    <div class="dtasks">${rows}</div>
    ${doneN === D.tasks.length ? `<p class="small" style="margin-top:8px;color:var(--good)">Все задания выполнены — план на сегодня закрыт.</p>` : ""}</section>`;
}
function wireDaily(){
  document.querySelectorAll("[data-dstart]").forEach(b => b.onclick = () => dailyStart(dailyEnsure().tasks[+b.dataset.dstart]));
  document.querySelectorAll("[data-dswap]").forEach(b => b.onclick = () => dailySwap(+b.dataset.dswap));
}
