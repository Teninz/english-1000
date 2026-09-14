// Чистая логика обучения и переносимых данных. Используется приложением и тестами Node.
const LearningCore = (() => {
  const intervals = [0, 1, 3, 7, 14, 30, 60];
  const dateOK = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
  const object = o => !!o && typeof o === "object" && !Array.isArray(o);
  const count = n => Number.isSafeInteger(n) && n >= 0;
  const norm = s => String(s).normalize("NFKC").toLowerCase().replace(/ё/g,"е").replace(/[’']/g,"'").replace(/[.,!?;:"«»()]/g," ").replace(/\s+/g," ").trim();
  const aliases = {"résumé":["resume","resumé"], analyse:["analyze"], fulfil:["fulfill"], labour:["labor"], neighbour:["neighbor"], neighbourhood:["neighborhood"], behaviour:["behavior"], colour:["color"], favourite:["favorite"], centre:["center"], theatre:["theater"], travelling:["traveling"], organise:["organize"], recognise:["recognize"], memorise:["memorize"], apologize:["apologise"], realise:["realize"]};
  function englishForms(word) {
    const target = norm(word), forms = new Set([target, ...(aliases[target] || [])]);
    for (const [base, variants] of Object.entries(aliases)) if (variants.includes(target)) { forms.add(base); variants.forEach(v => forms.add(v)); }
    return [...forms];
  }
  function englishMatch(answer, word) {
    const a = norm(answer).replace(/^(?:the word is|the answer is|it is|it's) /, "");
    return englishForms(word).includes(a);
  }
  function schedule(previous, ok, day, addDays, assisted = false) {
    const r = {...(previous || {box:0,due:day,ok:0,bad:0})};
    if (ok) {
      r.ok++;
      // Только самостоятельный ответ в срок меняет долгий интервал, не больше раза в день.
      if (!assisted && r.due <= day && r.lastScheduled !== day) {
        r.box = Math.min(6, r.box + 1);
        r.due = addDays(day, intervals[r.box]);
        r.lastScheduled = day;
      }
    } else {
      r.bad++;
      if (r.lastLapse !== day) r.box = Math.max(0, r.box - 2);
      r.lastLapse = day;
      r.lastScheduled = day;
      r.due = day;
    }
    // После ошибки повтор внутри сессии закрепляет ответ, завтра проверяем снова.
    if (ok && r.lastLapse === day) r.due = addDays(day, 1);
    r.lastAttempt = day;
    return r;
  }
  const empty = () => ({v:2,goal:10,streak:{n:0,last:null},days:{},w:{},modes:{},hard:{},set:{auto:true}});
  const petEmpty = () => ({completed:{},fed:0,pets:0,lastAction:null});
  function petMood(pet, day) {
    const dates = Object.keys(pet.completed).filter(d => d <= day).sort();
    const last = dates.at(-1);
    const missed = last ? Math.max(0, Math.round((Date.parse(day)-Date.parse(last))/86400000)-1) : 0;
    const mood = Math.min(3, missed);
    return {mood,missed,last:last || null,treats:Math.max(0,2+Object.keys(pet.completed).length-pet.fed)};
  }
  function petAction(pet, action, day) {
    const state = JSON.parse(JSON.stringify(pet)), m = petMood(state,day);
    if (m.mood === 3) return {state,message:"Лиса свернулась клубком. Короткое занятие поможет ей снова оживиться."};
    if (action === "feed") {
      if (!m.treats) return {state,message:"Угощения закончились. Новое ждёт за первое занятие дня."};
      state.fed++;
    } else if (action === "pet") state.pets++;
    else throw Error("Неизвестное действие");
    state.lastAction = {day,kind:action};
    const message = m.mood === 2 ? "Лиса чуть шевельнула ушами. Она скучает по вашим занятиям." : m.mood === 1 ? "Лиса тихо прижалась к тебе. Может, позанимаемся вместе?" : action === "feed" ? "Хрум! Лиса довольно облизывается." : "Лиса подставила голову и замахала хвостом.";
    return {state,message};
  }
  function validate(input) {
    // Ограничиваем размер и запрещаем ключи, опасные для последующего объединения объектов.
    const raw = JSON.stringify(input);
    if (!raw || raw.length > 4000000) throw Error("Слишком большой файл прогресса");
    const o = JSON.parse(raw, (k,v) => { if (["__proto__","constructor","prototype"].includes(k)) throw Error("Недопустимый ключ данных"); return v; });
    const fail = () => { throw Error("Структура прогресса повреждена"); };
    if (!object(o) || o.v !== 2 || ![5,10,15,20].includes(o.goal)) fail();
    for (const k of ["w","days","modes","streak"]) if (!object(o[k])) fail();
    if (!count(o.streak.n) || !(o.streak.last === null || dateOK(o.streak.last))) fail();
    for (const [word,r] of Object.entries(o.w)) {
      if (!word || word.length > 120 || !object(r) || !count(r.box) || r.box > 6 || !dateOK(r.due) || !count(r.ok) || !count(r.bad)) fail();
      for (const k of ["lastAttempt","lastScheduled","lastLapse"]) if (r[k] !== undefined && !dateOK(r[k])) fail();
    }
    for (const [d,r] of Object.entries(o.days)) {
      if (!dateOK(d) || !object(r) || !["n","q","ok","bad"].every(k => count(r[k]))) fail();
      if (r.words !== undefined && (!object(r.words) || !Object.values(r.words).every(v => v === 1))) fail();
      if (r.remembered !== undefined && (!object(r.remembered) || !Object.values(r.remembered).every(v => v === 1))) fail();
    }
    for (const r of Object.values(o.modes)) if (!object(r) || !count(r.ok) || !count(r.bad)) fail();
    o.hard = o.hard || {};
    if (!object(o.hard) || !Object.values(o.hard).every(v => v === 1 || v === true)) fail();
    o.set = object(o.set) ? o.set : {auto:true};
    if (o.ach !== undefined && (!object(o.ach) || !Object.values(o.ach).every(dateOK))) fail();
    const defaults = {near:0,pairsClean:0,voiceOk:0,road:0,scenes:{},themes:{},lastActive:null,modesDone:{},heard:{d:null,w:{}}};
    if (o.stats !== undefined && !object(o.stats)) fail();
    o.stats = {...defaults,...o.stats};
    for (const k of ["near","pairsClean","voiceOk","road"]) if (!count(o.stats[k])) fail();
    for (const k of ["scenes","themes","modesDone"]) if (!object(o.stats[k])) fail();
    if (!object(o.stats.heard) || !object(o.stats.heard.w)) fail();
    if (o.stats.lastActive !== null && !dateOK(o.stats.lastActive)) fail();
    for (const k of ["dailyDone","solvedSet"]) if (o.stats[k] !== undefined && !object(o.stats[k])) fail();
    if (o.journey !== undefined) {
      if (!object(o.journey) || !object(o.journey.completed) || !object(o.journey.rewards)) fail();
      if (!Object.entries(o.journey.completed).every(([d,v])=>dateOK(d)&&v===1) || !Object.values(o.journey.rewards).every(dateOK)) fail();
      const p=o.journey.plan;
      if(p!==undefined){
        if(!object(p)||!dateOK(p.day)||typeof p.done!=="boolean")fail();
        for(const k of ["review","fresh"])if(!Array.isArray(p[k])||p[k].length>20||!p[k].every(w=>typeof w==="string"&&w.length<=120))fail();
        for(const k of ["reviewed","checked","errors","repaired"])if(!object(p[k])||!Object.values(p[k]).every(v=>v===1))fail();
        if(p.phase!==undefined&&!["review","new","check","repair"].includes(p.phase))fail();
      }
    }
    if (o.companion !== undefined) {
      if (!object(o.companion) || !object(o.companion.completed) || !count(o.companion.fed) || !count(o.companion.pets)) fail();
      if (!Object.entries(o.companion.completed).every(([d,v])=>dateOK(d)&&v===1)) fail();
      if (o.companion.lastAction !== null && o.companion.lastAction !== undefined && (!object(o.companion.lastAction) || !dateOK(o.companion.lastAction.day) || !["feed","pet"].includes(o.companion.lastAction.kind))) fail();
    }
    if(o.daily!==undefined){
      const d=o.daily;
      if(!object(d)||!dateOK(d.d)||!Array.isArray(d.tasks)||d.tasks.length>5||!object(d.log))fail();
      for(const t of d.tasks){
        if(!object(t)||!["learn","review","level","hard","mode","lesson"].includes(t.id)||typeof t.done!=="boolean"||typeof t.swapped!=="boolean")fail();
        if(t.id==="mode"&&!["mc","rev","type","listen","gap","pairs","exam","pron","roadL","roadA"].includes(t.key))fail();
        if(t.id==="level"&&(!count(t.level)||t.level>19))fail();
        if(t.target!==undefined&&!count(t.target))fail();
      }
      for(const k of ["learn","review","heard","pronOk"])if(!count(d.log[k]))fail();
      if(!Array.isArray(d.log.sessions)||!d.log.sessions.every(s=>object(s)&&typeof s.mode==="string"&&count(s.n)&&typeof s.pct==="number"&&s.pct>=0&&s.pct<=1))fail();
    }
    return o;
  }
  function portable(state) {
    const o = validate(state), result = {format:"shadowfox-progress",exportedAt:new Date().toISOString()};
    for (const k of ["v","goal","streak","days","w","modes","hard","ach","stats","journey","companion"]) if (o[k] !== undefined) result[k] = o[k];
    if(result.journey)delete result.journey.plan;
    return result;
  }
  function prepareImport(input, current) {
    const o = validate(input);
    delete o.daily;
    if(o.journey)delete o.journey.plan;
    // Даже старый код с ключами не заменяет настройки голосов на этом устройстве.
    o.set = JSON.parse(JSON.stringify(current.set || {auto:true}));
    return o;
  }
  return {intervals,dateOK,norm,englishForms,englishMatch,schedule,empty,validate,portable,prepareImport,petEmpty,petMood,petAction};
})();
if (typeof module !== "undefined") module.exports = LearningCore;
