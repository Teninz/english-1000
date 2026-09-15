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
  const empty = () => ({v:2,goal:10,streak:{n:0,last:null},days:{},w:{},modes:{},hard:{},set:{auto:true},thematic:thematicEmpty()});
  const petEmpty = () => ({completed:{},fed:0,watered:0,pets:0,lastFed:null,lastWater:null,lastAction:null});
  function petMood(pet, day) {
    const dates = Object.keys(pet.completed).filter(d => d <= day).sort();
    const last = dates.at(-1);
    const missed = last ? Math.max(0, Math.round((Date.parse(day)-Date.parse(last))/86400000)-1) : 0;
    const mood = Math.min(3, missed);
    return {mood,missed,last:last || null,treats:Math.max(0,2+Object.keys(pet.completed).length-(pet.fed||0))};
  }
  function petAction(pet, action, day) {
    const state = JSON.parse(JSON.stringify(pet)), m = petMood(state,day);
    state.fed = state.fed || 0; state.watered = state.watered || 0; state.pets = state.pets || 0;
    if(state.lastFed===undefined)state.lastFed=null;
    if(state.lastWater===undefined)state.lastWater=null;
    if (m.mood === 3) return {state,message:"Лиса свернулась клубком. Короткое занятие поможет ей снова оживиться."};
    if (action === "feed") {
      if (!m.treats) return {state,message:"Угощения закончились. Новое ждёт за первое занятие дня."};
      state.fed++; state.lastFed=day;
    } else if (action === "water") {
      state.watered++; state.lastWater=day;
    } else if (action === "pet") state.pets++;
    else throw Error("Неизвестное действие");
    state.lastAction = {day,kind:action};
    const message = m.mood === 2 ? "Лиса чуть шевельнула ушами. Она скучает по вашим занятиям." : m.mood === 1 ? "Лиса тихо прижалась к тебе. Может, позанимаемся вместе?" : action === "feed" ? "Хрум! Лиса довольно облизывается." : action === "water" ? "Лиса напилась и довольно встряхнула ушами." : "Лиса подставила голову и замахала хвостом.";
    return {state,message};
  }
  const thematicIds = ["forest","village","travel","city","beach","space","science","rescue","shops","home"];
  const thematicEmpty = () => ({settings:{batchSize:5,reviewSize:15,autoSpeak:true},topics:{},equipmentRewards:{}});
  const thematicTopicEmpty = () => ({words:{},introduced:{},days:{},stats:{ok:0,bad:0},exam:{passedAt:null,attempts:0,lockedUntil:null,active:null,lastResult:null}});
  function thematicEnsure(state) {
    state.thematic = state.thematic || thematicEmpty();
    return state.thematic;
  }
  function thematicTopic(state, id) {
    if(!thematicIds.includes(id))throw Error("Неизвестный тематический маршрут");
    const root=thematicEnsure(state);
    return root.topics[id] || (root.topics[id]=thematicTopicEmpty());
  }
  function thematicIntroduce(topic, word, day, known=false) {
    if(typeof word!=="string"||!word||word.length>120||!dateOK(day))throw Error("Некорректное тематическое слово");
    if(!topic.words[word])topic.words[word]={box:known?6:0,due:day,ok:0,bad:0};
    else if(known){topic.words[word].box=6;topic.words[word].due=day;}
    topic.introduced[word]=1;
    return topic.words[word];
  }
  function thematicGrade(topic, word, ok, day, addDays, assisted=false) {
    if(!topic.introduced[word])throw Error("Слово ещё не изучено");
    topic.words[word]=schedule(topic.words[word],ok,day,addDays,assisted);
    ok?topic.stats.ok++:topic.stats.bad++;
    return topic.words[word];
  }
  const thematicExamReady = (topic,total=100) => Object.keys(topic.introduced).length===total;
  const THEMATIC_QUESTION_MS=6000, THEMATIC_COOLDOWN_MS=30*60*1000, THEMATIC_ERROR_LIMIT=5;
  function numberTime(value){return typeof value==="number"&&Number.isFinite(value)&&value>=0;}
  function shuffled(values,rng){const out=values.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function thematicExamCooldown(topic,nowWall){return Math.max(0,(topic.exam.lockedUntil||0)-nowWall);}
  function thematicExamFinish(topic,passed,nowWall,reason){
    const active=topic.exam.active;
    topic.exam.lastResult={passed,at:nowWall,reason,errors:active?.errors||0};
    if(passed){topic.exam.passedAt=topic.exam.passedAt||nowWall;topic.exam.lockedUntil=null;}
    else topic.exam.lockedUntil=nowWall+THEMATIC_COOLDOWN_MS;
    topic.exam.active=null;
    return {status:passed?"passed":"failed",reason,errors:topic.exam.lastResult.errors,lockedUntil:topic.exam.lockedUntil};
  }
  function thematicExamStart(topic,wordKeys,nowWall,nowMono,rng=Math.random){
    if(!thematicExamReady(topic,wordKeys.length)||wordKeys.length!==100||new Set(wordKeys).size!==100)throw Error("Сначала изучи все 100 слов маршрута");
    if(!numberTime(nowWall)||!numberTime(nowMono))throw Error("Некорректное время экзамена");
    if(thematicExamCooldown(topic,nowWall))throw Error("Блиц временно заблокирован");
    topic.exam.attempts++;
    topic.exam.active={attemptId:`${nowWall}-${topic.exam.attempts}`,order:shuffled(wordKeys,rng),index:0,errors:0,correct:0,startedWall:nowWall,questionWall:nowWall,questionMono:nowMono};
    return topic.exam.active;
  }
  function thematicExamTick(topic,nowWall,nowMono){
    const active=topic.exam.active;
    if(!active)return {status:"inactive",missed:0};
    if(!numberTime(nowWall)||!numberTime(nowMono))return thematicExamFinish(topic,false,Math.max(0,nowWall||0),"clock");
    const wallElapsed=nowWall-active.questionWall;
    if(wallElapsed < -1000)return thematicExamFinish(topic,false,nowWall,"clock");
    const monoElapsed=nowMono>=active.questionMono?nowMono-active.questionMono:0;
    const elapsed=Math.max(0,wallElapsed,monoElapsed);
    const missed=Math.min(Math.floor(elapsed/THEMATIC_QUESTION_MS),active.order.length-active.index);
    if(!missed)return {status:"active",missed:0,remaining:THEMATIC_QUESTION_MS-elapsed};
    const applied=Math.min(missed,THEMATIC_ERROR_LIMIT-active.errors);
    active.index+=applied;active.errors+=applied;
    if(active.errors>=THEMATIC_ERROR_LIMIT)return {...thematicExamFinish(topic,false,nowWall,"errors"),missed:applied};
    if(active.index>=active.order.length)return {...thematicExamFinish(topic,true,nowWall,"complete"),missed:applied};
    active.questionWall+=applied*THEMATIC_QUESTION_MS;
    active.questionMono+=applied*THEMATIC_QUESTION_MS;
    return {status:"active",missed:applied,remaining:Math.max(0,THEMATIC_QUESTION_MS-(elapsed-applied*THEMATIC_QUESTION_MS))};
  }
  function thematicExamAnswer(topic,correct,nowWall,nowMono){
    const tick=thematicExamTick(topic,nowWall,nowMono);
    if(tick.status!=="active"||tick.missed)return tick;
    const active=topic.exam.active;
    if(correct)active.correct++;else active.errors++;
    active.index++;
    if(active.errors>=THEMATIC_ERROR_LIMIT)return thematicExamFinish(topic,false,nowWall,"errors");
    if(active.index>=active.order.length)return thematicExamFinish(topic,true,nowWall,"complete");
    active.questionWall=nowWall;active.questionMono=nowMono;
    return {status:"active",correct:!!correct,index:active.index,errors:active.errors,remaining:THEMATIC_QUESTION_MS};
  }
  function thematicExamAbort(topic,nowWall){
    if(!topic.exam.active)return {status:"inactive"};
    return thematicExamFinish(topic,false,nowWall,"aborted");
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
      if (o.companion.watered !== undefined && !count(o.companion.watered)) fail();
      for(const k of ["lastFed","lastWater"])if(o.companion[k]!==undefined&&o.companion[k]!==null&&!dateOK(o.companion[k]))fail();
      if (o.companion.lastAction !== null && o.companion.lastAction !== undefined && (!object(o.companion.lastAction) || !dateOK(o.companion.lastAction.day) || !["feed","water","pet"].includes(o.companion.lastAction.kind))) fail();
      o.companion.watered=o.companion.watered||0;
      if(o.companion.lastFed===undefined)o.companion.lastFed=null;
      if(o.companion.lastWater===undefined)o.companion.lastWater=null;
    }
    o.thematic=o.thematic||thematicEmpty();
    if(!object(o.thematic)||!object(o.thematic.settings)||!object(o.thematic.topics)||!object(o.thematic.equipmentRewards))fail();
    if(![5,10].includes(o.thematic.settings.batchSize)||![10,15,20].includes(o.thematic.settings.reviewSize)||typeof o.thematic.settings.autoSpeak!=="boolean")fail();
    if(!Object.values(o.thematic.equipmentRewards).every(dateOK))fail();
    for(const [id,t] of Object.entries(o.thematic.topics)){
      if(!thematicIds.includes(id)||!object(t)||!object(t.words)||!object(t.introduced)||!object(t.days)||!object(t.stats)||!object(t.exam))fail();
      for(const [word,r] of Object.entries(t.words)){
        if(!word||word.length>120||!object(r)||!count(r.box)||r.box>6||!dateOK(r.due)||!count(r.ok)||!count(r.bad))fail();
        for(const k of ["lastAttempt","lastScheduled","lastLapse"])if(r[k]!==undefined&&!dateOK(r[k]))fail();
      }
      if(!Object.entries(t.introduced).every(([word,v])=>word&&word.length<=120&&v===1&&object(t.words[word])))fail();
      if(!count(t.stats.ok)||!count(t.stats.bad)||!count(t.exam.attempts))fail();
      if(t.exam.passedAt!==null&&!numberTime(t.exam.passedAt))fail();
      if(t.exam.lockedUntil!==null&&!numberTime(t.exam.lockedUntil))fail();
      if(t.exam.lastResult!==null){const r=t.exam.lastResult;if(!object(r)||typeof r.passed!=="boolean"||!numberTime(r.at)||!["complete","errors","aborted","clock"].includes(r.reason)||!count(r.errors)||r.errors>5)fail();}
      if(t.exam.active!==null){
        const a=t.exam.active;
        if(!object(a)||typeof a.attemptId!=="string"||!Array.isArray(a.order)||a.order.length!==100||new Set(a.order).size!==100||!a.order.every(w=>typeof w==="string"&&t.introduced[w]===1))fail();
        if(!count(a.index)||a.index>=100||!count(a.errors)||a.errors>=5||!count(a.correct)||!numberTime(a.startedWall)||!numberTime(a.questionWall)||!numberTime(a.questionMono))fail();
      }
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
    for (const k of ["v","goal","streak","days","w","modes","hard","ach","stats","journey","companion","thematic"]) if (o[k] !== undefined) result[k] = o[k];
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
  return {intervals,dateOK,norm,englishForms,englishMatch,schedule,empty,validate,portable,prepareImport,petEmpty,petMood,petAction,thematicIds,thematicEmpty,thematicTopicEmpty,thematicEnsure,thematicTopic,thematicIntroduce,thematicGrade,thematicExamReady,thematicExamCooldown,thematicExamStart,thematicExamTick,thematicExamAnswer,thematicExamAbort,THEMATIC_QUESTION_MS,THEMATIC_COOLDOWN_MS,THEMATIC_ERROR_LIMIT};
})();
if (typeof module !== "undefined") module.exports = LearningCore;
