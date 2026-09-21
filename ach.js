// Достижения. Определения, счётчики и проверка. Подключается после tts.js, до native.js.
// Разблокированные хранятся в S.ach = {id: дата}; вспомогательные счётчики — в S.stats.
const ACH = [
  // путь — только закреплённые слова (ячейка 6, подтверждённые ответами), не просмотр карточек
  { id:"fixed1",    icon:"🌱", title:"Первое закреплённое",  desc:"Закрепить первое слово" },
  { id:"fixed10",   icon:"🔟", title:"Десятка",             desc:"Закрепить 10 слов" },
  { id:"fixed100",  icon:"💯", title:"Сотня",               desc:"Закрепить 100 слов" },
  { id:"fixed300",  icon:"🌿", title:"Триста",              desc:"Закрепить 300 слов" },
  { id:"fixed500",  icon:"🌗", title:"Пятьсот",             desc:"Закрепить 500 слов" },
  { id:"fixed1000", icon:"🏁", title:"Тысяча",              desc:"Закрепить 1000 слов" },
  { id:"fixed2000", icon:"🏔️", title:"Две тысячи",          desc:"Закрепить 2000 слов", hard:true },
  { id:"fixed3000", icon:"🎓", title:"Oxford 3000",         desc:"Закрепить 3000 слов", hard:true },
  { id:"master",    icon:"👑", title:"Мастер",              desc:"Закрепить все слова программы", hard:true },
  // уровни — все слова уровня в «знаю» или выше по ответам
  { id:"levelA1",   icon:"🅰️", title:"Уровень A1",          desc:"Все слова A1 в «знаю» или выше" },
  { id:"levelA2",   icon:"🔤", title:"Уровень A2",          desc:"Все слова A2 в «знаю» или выше" },
  { id:"levelB1",   icon:"🅱️", title:"Уровень B1",          desc:"Все слова B1 в «знаю» или выше" },
  { id:"levelB2",   icon:"🏅", title:"Уровень B2",          desc:"Все слова B2 в «знаю» или выше", hard:true },
  // регулярность
  { id:"streak3",   icon:"🔥", title:"Три дня подряд",      desc:"Заниматься три дня без пропуска" },
  { id:"streak7",   icon:"📅", title:"Неделя",              desc:"Серия из 7 дней" },
  { id:"streak30",  icon:"🗓️", title:"Месяц",               desc:"Серия из 30 дней" },
  { id:"weekly4",   icon:"🎯", title:"Четыре дня в неделю",  desc:"Заниматься четыре дня из последних семи" },
  { id:"rhythm4",   icon:"🥁", title:"Ритм",                desc:"Четыре недели подряд по четыре дня занятий", hard:true },
  { id:"comeback",  icon:"🦊", title:"Мы скучали",          desc:"Вернуться после перерыва в неделю и пройти сессию", hidden:"Лиса умеет ждать" },
  { id:"owl",       icon:"🦉", title:"Сова",                desc:"Закончить сессию между полуночью и пятью утра", hidden:"Что-то про поздний час" },
  { id:"lark",      icon:"🐦", title:"Жаворонок",           desc:"Закончить сессию между пятью и семью утра", hidden:"Что-то про ранний час" },
  // мастерство
  { id:"perfect",   icon:"✨", title:"Без единой ошибки",   desc:"Сессия от 10 вопросов на 100%" },
  { id:"exam",      icon:"🎓", title:"Отличник",            desc:"Экзамен 20 из 20" },
  { id:"sprint",    icon:"⚡", title:"Спринтер",            desc:"Экзамен быстрее 90 секунд с результатом не ниже 80%", hidden:"Скорость тоже считается" },
  { id:"allmodes",  icon:"🧩", title:"Всеядный",            desc:"Пройти все восемь видов проверки" },
  { id:"pairs5",    icon:"🤝", title:"Чистые пары",         desc:"Пять раз собрать пары без единой ошибки" },
  { id:"voice10",   icon:"🎙️", title:"Говорун",             desc:"10 верных ответов голосом" },
  { id:"road50",    icon:"🎧", title:"Попутчик",            desc:"50 слов в режиме «В дороге»" },
  { id:"marathon",  icon:"🏔️", title:"Марафон",             desc:"Прослушать все 1000 слов за один день", hard:true },
  { id:"daily1",    icon:"📋", title:"План на день",        desc:"Выполнить все задания дня" },
  { id:"daily7",    icon:"🗂️", title:"Неделя по плану",     desc:"Закрыть задания дня семь раз" },
  // сложные слова
  { id:"hard10",    icon:"🚩", title:"Коллекционер проблем", desc:"Пометить 10 сложных слов" },
  { id:"solved",    icon:"🔓", title:"Разобрался",          desc:"Закрепить 10 слов, помеченных сложными" },
  { id:"solved50",  icon:"🗝️", title:"Укротитель",           desc:"Закрепить 50 слов, помеченных сложными", hard:true },
  // забавные
  { id:"zero",      icon:"🫠", title:"Полный ноль",         desc:"Все ответы в сессии мимо. Зато теперь точно ясно, что повторять", fun:true, hidden:"Откроется само — когда день пойдёт не по плану" },
  { id:"stubborn",  icon:"🐐", title:"Упрямец",             desc:"Ошибиться в одном и том же слове пять раз. Оно не сдаётся — ты тоже", fun:true, hidden:"Есть слова с характером" },
  { id:"almost",    icon:"🤏", title:"Почти",               desc:"Пять ответов засчитаны «с одной опечаткой»", fun:true, hidden:"Рука дрогнула" },
  { id:"tourist",   icon:"🍂", title:"Турист",              desc:"Побывать во всех четырёх осенних сценах", hidden:"Осень бывает разной" },
  { id:"daynight",  icon:"🌗", title:"Сутки",               desc:"Переключить и ночь, и день", hidden:"Свет и тень" },
  { id:"ownvoice",  icon:"📦", title:"Свой голос",          desc:"Скачать встроенный офлайн-голос", hidden:"Загляни в настройки голосов" },
  { id:"hundredday",icon:"🏭", title:"Стахановец",          desc:"Начать 100 слов за один день", hidden:"Один день, много слов" },
  ...THEMATIC_META.map(t=>({id:"topic_"+t.id,icon:t.icon,title:"Маршрут: "+t.title,desc:"Пройти блиц-экзамен «"+t.title+"» и получить "+t.reward})),
];
const ACH_BY = Object.fromEntries(ACH.map(a => [a.id, a]));
function achStats(){ S.ach = S.ach || {}; for(const id of ["first","ten","hundred","half","thousand"]) delete S.ach[id]; S.stats = S.stats || { near:0, pairsClean:0, voiceOk:0, road:0, scenes:{}, themes:{}, lastActive:null, modesDone:{}, heard:{d:null, w:{}} }; return S.stats; }
function unlock(id){
  achStats(); if(S.ach[id]) return; const a = ACH_BY[id]; if(!a) return;
  S.ach[id] = today(); save(); buzz(true); if(typeof cue==="function") cue("ok");
  const old = $(".ach-pop"); if(old) old.remove();
  const el = document.createElement("div"); el.className = "ach-pop";
  el.innerHTML = `<span class="ach-ic">${a.icon}</span><span><small>Достижение</small><b>${esc(a.title)}</b></span>`;
  document.body.appendChild(el); el.onclick = () => { el.remove(); achSheet(); };
  setTimeout(() => el.classList.add("show"), 20); setTimeout(() => { el.classList.remove("show"); setTimeout(()=>el.remove(), 400); }, 4200);
}
const achCount = () => Object.keys(S.ach||{}).filter(id => ACH_BY[id]).length;
// дни с занятиями в окне [from; to] включительно
const activeDays = (from, to) => Object.entries(S.days).filter(([d,r]) => d >= from && d <= to && ((r.n||0) + (r.q||0)) > 0).length;
// проверки по событиям
function checkAch(ev, p = {}){
  // слова, отмеченные известными без проверки (стартовая проверка, «Уже знаю»), в достижения не идут, пока не подтверждены ответом
  const st = achStats(); const started = startedList().filter(i => !W(i).known), known = started.filter(i => status(i) >= 2), fixed = started.filter(i => status(i) === 3);
  for(const [n,id] of [[1,"fixed1"],[10,"fixed10"],[100,"fixed100"],[300,"fixed300"],[500,"fixed500"],[1000,"fixed1000"],[2000,"fixed2000"],[3000,"fixed3000"]]) if(fixed.length >= n) unlock(id);
  if(fixed.length >= WORDS.length) unlock("master");
  for(const L of PROGRAM_LEVELS) if(L.total && L.blocks.length && L.blocks.every(b => b.ids.every(i => W(i) && !W(i).known && status(i) >= 2))) unlock("level"+L.id);
  if(S.streak.n >= 3) unlock("streak3"); if(S.streak.n >= 7) unlock("streak7"); if(S.streak.n >= 30) unlock("streak30");
  { const t = today(); const weeks = [0,1,2,3].map(w => activeDays(addDays(t,-7*w-6), addDays(t,-7*w))); if(weeks[0] >= 4) unlock("weekly4"); if(weeks.every(n => n >= 4)) unlock("rhythm4"); }
  if((dayRec().n||0) >= 100) unlock("hundredday");
  if(Object.keys(S.hard||{}).length >= 10) unlock("hard10");
  if(ev === "session"){ // p: {mode, res:[{i,ok,kind}], ms}
    const n = p.res.length, ok = p.res.filter(x=>x.ok).length; const h = new Date().getHours();
    if(n >= 10 && ok === n) unlock("perfect");
    if(p.mode === "exam" && n === 20 && ok === 20) unlock("exam");
    if(p.mode === "exam" && n === 20 && p.ms < 90000 && ok/n >= .8) unlock("sprint");
    if(n >= 5 && ok === 0) unlock("zero");
    if(h < 5) unlock("owl"); if(h >= 5 && h < 7) unlock("lark");
    if(st.lastActive && (new Date(today()+"T12:00:00") - new Date(st.lastActive+"T12:00:00")) / 864e5 >= 7) unlock("comeback");
    if(p.mode && p.mode !== "review" && p.mode !== "learn" && p.mode !== "voice"){ st.modesDone[p.mode] = 1; if(["mc","rev","type","listen","pron","pairs","gap","exam"].every(m => st.modesDone[m])) unlock("allmodes"); }
    st.voiceOk += p.res.filter(x => x.ok && (x.kind === "pron" || x.kind === "voice")).length; if(st.voiceOk >= 10) unlock("voice10");
    if(p.road){ st.road += n; if(st.road >= 50) unlock("road50"); }
    st.lastActive = today();
  }
  if(ev === "grade"){ const r = W(p.i); if(r && r.bad >= 5) unlock("stubborn"); if(r && isHard(p.i) && r.box >= 6){ st.solvedSet = st.solvedSet || {}; st.solvedSet[wk(p.i)] = 1; const n = Object.keys(st.solvedSet).length; if(n >= 10) unlock("solved"); if(n >= 50) unlock("solved50"); } }
  if(ev === "near"){ st.near++; if(st.near >= 5) unlock("almost"); }
  if(ev === "pairsClean"){ st.pairsClean++; if(st.pairsClean >= 5) unlock("pairs5"); }
  if(ev === "heard"){ if(st.heard.d !== today()) st.heard = { d: today(), w: {} }; st.heard.w[wk(p.i)] = 1; st.road++; if(st.road >= 50) unlock("road50"); if(Object.keys(st.heard.w).length >= 1000) unlock("marathon"); }
  if(ev === "scene"){ if(p.scene && p.scene !== "none") st.scenes[p.scene] = 1; if(["town","village","sea","mountain"].every(k => st.scenes[k])) unlock("tourist"); }
  if(ev === "theme"){ st.themes[p.theme] = 1; if(st.themes.dark && st.themes.light) unlock("daynight"); }
  if(ev === "piper") unlock("ownvoice");
  save();
}
// экран достижений
function achSheet(){
  achStats(); const got = achCount();
  const cards = ACH.map(a => { const d = S.ach[a.id]; const secret = a.hidden && !d; return `<div class="ach ${d?"on":""} ${a.fun?"fun":""} ${a.hard?"hard":""}"><span class="ach-ic">${secret ? "❔" : a.icon}</span><b>${esc(secret ? "Секретное" : a.title)}</b><span class="small muted">${esc(secret ? a.hidden : a.desc)}</span>${d?`<span class="small" style="color:var(--good)">открыто ${esc(d)}</span>`:""}</div>`; }).join("");
  sheet(`<div class="row between"><h2>Достижения</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div>
    <div class="row between"><span class="muted">Открыто ${got} из ${ACH.length} · скрытых ${ACH.filter(x=>x.hidden&&!S.ach[x.id]).length}</span><span class="chip warn">🏔️ самое сложное — «Марафон»</span></div>
    <div class="bar"><i style="width:${got/ACH.length*100}%"></i></div>
    <div class="ach-grid">${cards}</div>`);
}
// карточка на главной
function achCardHtml(){
  achStats(); const got = achCount(); const last = Object.entries(S.ach).filter(([id])=>ACH_BY[id]).sort((a,b)=>a[1]<b[1]?1:-1).slice(0,4);
  return `<section class="card" id="achCard" style="cursor:pointer"><div class="row between"><div class="eyebrow">Достижения</div><span class="small muted num">${got} / ${ACH.length}</span></div>
    <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">${last.length ? last.map(([id]) => `<span class="chip accent">${ACH_BY[id].icon} ${esc(ACH_BY[id].title)}</span>`).join("") : `<span class="small muted">Первое откроется, как только начнёшь первое слово</span>`}</div></section>`;
}
