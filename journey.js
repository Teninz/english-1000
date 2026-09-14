// Готовое занятие, лиса-компаньон и постоянная коллекция учебных наград.
const FOX_REWARDS = [
  {id:"hello",icon:"🍃",name:"Первый лист",desc:"Завершить первое занятие",at:1},
  {id:"three",icon:"🧣",name:"Тёплый шарф",desc:"Заниматься в три разных дня",at:3},
  {id:"seven",icon:"🏮",name:"Лесной фонарь",desc:"Заниматься в семь разных дней",at:7},
  {id:"fourteen",icon:"🫖",name:"Вечерний чай",desc:"Заниматься в четырнадцать разных дней",at:14},
  {id:"thirty",icon:"🏡",name:"Дом для лисы",desc:"Заниматься в тридцать разных дней",at:30}
];
const FOX_ANIMATION_MS = {idle:5000,listen:3000,pet:2667,feed:3167,happy:2334,quiet:5334,sad:6000,withdrawn:6667};
const FOX_STATIC_ASSET = {idle:"idle",listen:"curious",pet:"pet",feed:"feed",happy:"happy",quiet:"sad-1",sad:"sad-2",withdrawn:"sleep"};
const foxReducedMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const foxMoodAnimation = mood => ["idle","quiet","sad","withdrawn"][mood] || "idle";
function foxAsset(animation){
  return foxReducedMotion() ? `art/companion/${FOX_STATIC_ASSET[animation]||"idle"}.png` : `art/companion-anim/${animation}.png`;
}
let foxAnimationTimer = 0;
function playFoxAnimation(animation,mood,loop=false){
  const fox=$(".fox-pet"); if(!fox)return;
  clearTimeout(foxAnimationTimer);
  fox.src=foxAsset(animation)+(foxReducedMotion()?"":`?play=${Date.now()}`);
  fox.dataset.animation=animation;
  if(!loop&&!foxReducedMotion())foxAnimationTimer=setTimeout(()=>{
    if(!fox.isConnected)return;
    const next=foxMoodAnimation(mood); fox.src=foxAsset(next); fox.dataset.animation=next;
  },FOX_ANIMATION_MS[animation]||2400);
}
function journeyState(){
  S.journey = S.journey || {completed:{},rewards:{}};
  S.companion = S.companion || LearningCore.petEmpty();
  return S.journey;
}
function lessonComplete(){
  const j = journeyState(), day = today(), first = !S.companion.completed[day];
  j.completed[day] = 1; S.companion.completed[day] = 1;
  const total = Object.keys(j.completed).length;
  for(const reward of FOX_REWARDS) if(total >= reward.at && !j.rewards[reward.id]) j.rewards[reward.id] = day;
  save();
  if(window.syncCompanion) window.syncCompanion();
  return first;
}
function maybeCompleteLesson(results){
  if(new Set(results.filter(r=>!r.retry).map(r=>r.i)).size >= 5) lessonComplete();
}
function activeStreak(){ return S.streak.last && S.streak.last >= addDays(today(),-1) ? S.streak.n : 0; }
function activityCount(){ return Object.keys(dayRec().words || {}).length; }
function memoryCount(){ return Object.keys(dayRec().remembered || {}).length; }
function companionCardHtml(){
  const j = journeyState(), p = LearningCore.petMood(S.companion,today());
  const moods = ["Рада тебя видеть", "Притихла", "Скучает по тебе", "Свернулась клубком"];
  const texts = [p.last === today() ? "Сегодня мы уже позанимались. Спасибо, что заглянул!" : p.last ? "У нас есть несколько слов для короткого занятия." : "Я твоя лиса. Давай начнём с пяти слов?", "Один день без занятия. Лиса ждёт вашей следующей встречи.", "Два дня без занятия. На ласку отвечает лишь движением ушек.", "Три дня или больше без занятия. Еда и ласка пока не помогают — начните урок вместе."];
  const total = Object.keys(j.completed).length, next = FOX_REWARDS.find(r=>!j.rewards[r.id]);
  const week = Array.from({length:7},(_,i)=>addDays(today(),i-6));
  const weekly = week.filter(d=>j.completed[d]).length;
  return `<section class="card companion" id="companionCard">
    <div class="row between"><div class="eyebrow">Твоя лиса</div><button class="btn ghost small" id="foxCollection">Коллекция · ${Object.keys(j.rewards).length}/${FOX_REWARDS.length}</button></div>
    <div class="fox-meeting"><img class="fox-pet mood-${p.mood}" data-animation="${foxMoodAnimation(p.mood)}" src="${foxAsset(foxMoodAnimation(p.mood))}" alt="Лиса: ${moods[p.mood]}"><div><h2>${moods[p.mood]}</h2><p class="small muted">${texts[p.mood]}</p></div></div>
    <p class="small fox-response" id="foxResponse" role="status" aria-live="polite">${memoryCount() ? `Сегодня ты вспомнил ${plural(memoryCount(),"слово","слова","слов")} после перерыва.` : "Первое занятие дня приносит одно угощение. Награды остаются с тобой."}</p>
    <div class="grid2"><button class="btn secondary" id="foxFeed" ${p.mood===3 || !p.treats ? "disabled":""}>Угостить · ${p.treats}</button><button class="btn secondary" id="foxPet" ${p.mood===3?"disabled":""}>Погладить</button></div>
    <div class="fox-week" aria-label="Занятия за последние семь дней">${week.map(d=>`<span class="${j.completed[d]?"done":""}" title="${d}">${j.completed[d]?"✓":"·"}</span>`).join("")}<b>${weekly}/4 дня</b></div>
    <p class="small muted">${weekly>=4?"Недельная цель выполнена. Можно отдохнуть или продолжить в своём темпе.":"Цель — четыре дня занятий за последние семь. Не обязательно подряд."}</p>
    ${window.pinCompanion?'<button class="btn ghost small" id="foxPin">Добавить лису на рабочий стол</button>':""}
    ${next?`<p class="small" style="margin-top:8px">${next.icon} До награды «${next.name}» — ${plural(Math.max(0,next.at-total),"день занятий","дня занятий","дней занятий")}.</p>`:`<p class="small">Вся коллекция собрана. Лиса остаётся рядом!</p>`}
  </section>`;
}
function foxFaceIcon(){return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 8l12 7h8L40 8l-3 24-13 9-13-9z" fill="currentColor"/><path d="M14 14l7 5-8 5zm20 0l-7 5 8 5z" fill="var(--fox-warm)"/><path d="M16 27l8 10 8-10-8 4z" fill="var(--fox-light)"/><circle cx="18" cy="25" r="2"/><circle cx="30" cy="25" r="2"/><path d="M21 32h6l-3 3z" fill="var(--fox-warm)"/></svg>`;}
function openCompanion(options={}){
  journeyState();
  const host=$("#foxDrawerHost"); if(!host)return;
  host.innerHTML=`<div class="fox-drawer-scrim"><aside class="fox-drawer" role="dialog" aria-modal="true" aria-labelledby="foxDrawerTitle"><div class="fox-drawer-head"><div><div class="eyebrow">Компаньон</div><h2 id="foxDrawerTitle">Домик лисы</h2></div><button class="icon-btn" id="foxDrawerClose" aria-label="Закрыть">${ICONS.close}</button></div>${journeyHeroHtml()}${companionCardHtml()}</aside></div>`;
  document.body.classList.add("fox-drawer-open");
  $("#foxDrawerClose").onclick=closeCompanion;
  $(".fox-drawer-scrim").onclick=e=>{if(e.target===e.currentTarget)closeCompanion();};
  wireCompanion(); if($("#hJourney"))$("#hJourney").onclick=journeyStart;
  const mood=LearningCore.petMood(S.companion,today()).mood;
  if(options.celebrate)playFoxAnimation("happy",mood);
  else if(mood===0)playFoxAnimation("listen",mood);
  $("#foxDrawerClose").focus();
}
function closeCompanion(){
  clearTimeout(foxAnimationTimer); foxAnimationTimer=0;
  const host=$("#foxDrawerHost");if(host)host.innerHTML="";
  document.body.classList.remove("fox-drawer-open");
  $("#foxHandle")?.focus();
}
function companionDrawerOpen(){return !!document.querySelector(".fox-drawer");}
function progressAccordionHtml(){
  const started=startedList(), statuses=[0,1,2,3].map(s=>allIdx().filter(i=>status(i)===s).length);
  const learned=statuses[2]+statuses[3], recent=Array.from({length:14},(_,k)=>{const day=addDays(today(),k-13),r=S.days[day],value=r?(r.n||0)+(r.q||0):0;return {day,value};});
  const max=Math.max(1,...recent.map(x=>x.value));
  const modeRows=Object.entries(S.modes).map(([key,m])=>{const total=m.ok+m.bad,pct=total?Math.round(100*m.ok/total):0;return `<div class="progress-row"><span>${esc(MODE_META[key]?.short||key)}</span><i><b style="width:${pct}%"></b></i><strong>${pct}%</strong></div>`;}).join("");
  const next7=Array.from({length:7},(_,i)=>{const day=addDays(today(),i),count=started.filter(index=>W(index).due===day).length;return {day,count};});
  return `<details class="card progress-accordion"><summary><span><span class="eyebrow">Инфографика</span><b>Пройденный материал</b></span><strong class="num">${learned} / 1000</strong></summary><div class="progress-body">
    <div class="progress-overview"><div class="progress-donut" style="--done:${learned/1000*360}deg"><span><b>${Math.round(learned/10)}%</b><small>изучено</small></span></div><div class="progress-legend"><span><i class="s1"></i>Учу <b>${statuses[1]}</b></span><span><i class="s2"></i>Знаю <b>${statuses[2]}</b></span><span><i class="s3"></i>Закреплено <b>${statuses[3]}</b></span><span><i></i>Впереди <b>${statuses[0]}</b></span></div></div>
    <div><div class="row between"><b>Активность за 14 дней</b><span class="small muted">слова</span></div><div class="progress-bars">${recent.map((x,i)=>`<i class="${x.value?"on":""} ${i===13?"today":""}" style="height:${Math.max(5,Math.round(x.value/max*100))}%" title="${x.day}: ${x.value}"></i>`).join("")}</div></div>
    <div><b>Повторения на неделю</b><div class="due-week">${next7.map((x,i)=>`<span class="${x.count?"has":""}"><small>${i?new Date(x.day+"T12:00:00").toLocaleDateString("ru-RU",{weekday:"short"}):"сегодня"}</small><b>${x.count}</b></span>`).join("")}</div></div>
    ${modeRows?`<div><b>Точность по режимам</b><div class="progress-modes">${modeRows}</div></div>`:""}
  </div></details>`;
}
function companionCollection(){
  const j = journeyState();
  sheet(`<div class="row between"><h2>Сокровища лисы</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div><p class="muted">Память о ваших занятиях. Пропуски не отнимают награды.</p><div class="fox-rewards">${FOX_REWARDS.map(r=>`<div class="card ${j.rewards[r.id]?"earned":""}"><span class="reward-icon">${r.icon}</span><b>${r.name}</b><p class="small muted">${r.desc}</p><span class="small">${j.rewards[r.id]?`Получено ${j.rewards[r.id]}`:"Ещё впереди"}</span></div>`).join("")}</div><p class="small muted">После первого полного пропущенного дня лиса притихает, после второго грустит, после третьего не реагирует на еду и ласку. Одно завершённое занятие возвращает её к общению.</p>`);
}
async function companionAct(action){
  const buttons = [$("#foxFeed"),$("#foxPet")]; buttons.forEach(b=>{if(b)b.disabled=true;});
  try {
    journeyState();
    const result = window.nativeCompanionAction ? await window.nativeCompanionAction(action) : LearningCore.petAction(S.companion,action,today());
    S.companion = result.state; save();
    const mood=LearningCore.petMood(S.companion,today()).mood;
    const response=$("#foxResponse"); if(response)response.textContent=result.message;
    const feed=$("#foxFeed"); if(feed){feed.textContent=`Угостить · ${LearningCore.petMood(S.companion,today()).treats}`;feed.disabled=mood===3||!LearningCore.petMood(S.companion,today()).treats;}
    const pet=$("#foxPet");if(pet)pet.disabled=mood===3;
    playFoxAnimation(action,mood);
  } catch(e) { toast("Не удалось сохранить действие. Попробуй ещё раз."); if(tab==="home"&&!inSession)renderHome(); }
}
function wireCompanion(){
  if($("#foxFeed"))$("#foxFeed").onclick=()=>companionAct("feed"); if($("#foxPet"))$("#foxPet").onclick=()=>companionAct("pet"); if($("#foxCollection"))$("#foxCollection").onclick=companionCollection;
  if($("#foxPin"))$("#foxPin").onclick=()=>window.pinCompanion().catch(()=>toast("Добавь виджет через меню рабочего стола"));
}
let journeyRunning = false;
function journeyPlan(){
  const j = journeyState();
  if(!j.plan || j.plan.day !== today()) {
    const un = unstartedList(), level = learnLevel !== null && un.some(i=>levelOf(i)===learnLevel) ? learnLevel : un.length ? levelOf(un[0]) : 0;
    j.plan = {day:today(),review:dueList().sort((a,b)=>W(a).due.localeCompare(W(b).due)).slice(0,8).map(wk),fresh:un.filter(i=>levelOf(i)===level).slice(0,5).map(wk),reviewed:{},checked:{},errors:{},repaired:{},done:false};
    // Если новых и плановых слов нет, предлагаем короткую практику без изменения будущих интервалов.
    if(!j.plan.review.length && !j.plan.fresh.length) j.plan.review=sample(startedList(),5).map(wk);
    save();
  }
  return j.plan;
}
function journeyRecord(i,ok){
  if(!journeyRunning) return;
  const p=journeyPlan(), word=wk(i);
  if(p.phase==="review") p.reviewed[word]=1;
  if(p.phase==="check") p.checked[word]=1;
  if(p.phase==="repair") p.repaired[word]=1;
  if(!ok) p.errors[word]=1;
  save();
}
function journeyStart(){
  closeCompanion(); endSession(); journeyRunning=true; tab="home"; renderTabs();
  const p=journeyPlan();
  // Запоминаем до старта, было ли занятие сегодня: день отмечается ещё внутри проверки, и в финале это уже не видно.
  if(p.firstOfDay===undefined){p.firstOfDay=!journeyState().completed[today()];save();}
  if(p.done){ journeyRunning=false; go("home"); toast("Занятие на сегодня завершено. Другие тренировки доступны во вкладках."); return; }
  journeyNext();
}
function journeyNext(){
  journeyRunning=true;
  const p=journeyPlan(), ids=words=>words.map(w=>WORDS.findIndex(x=>x[0]===w)).filter(i=>i>=0);
  const review=ids(p.review.filter(w=>!p.reviewed[w]));
  if(review.length){p.phase="review";save();startSession({title:"Сегодня · вспоминаем",items:review.map(i=>({i,kind:kindForBox(W(i)?.box||0,i)})),mode:"review",after:"home",onComplete:journeyNext});return;}
  const fresh=ids(p.fresh).filter(i=>!W(i));
  if(fresh.length){p.phase="new";save();startLearnBatch(fresh,()=>journeyNext());return;}
  const check=ids(p.fresh.filter(w=>!p.checked[w])).filter(i=>W(i)?.box<6);
  if(check.length){p.phase="check";save();startSession({title:"Сегодня · новые слова",items:check.map(i=>({i,kind:"mc"})),mode:"learn",after:"home",onComplete:journeyNext});return;}
  const repair=ids(Object.keys(p.errors).filter(w=>!p.repaired[w]));
  if(repair.length){p.phase="repair";save();startSession({title:"Сегодня · ещё одна встреча",items:repair.map(i=>({i,kind:"mc"})),mode:"repair",after:"home",onComplete:journeyNext});return;}
  p.done=true; journeyRunning=false; inSession=false; lessonComplete(); const first=p.firstOfDay!==false;
  go("home"); openCompanion({celebrate:true});
  const response=$("#foxResponse");if(response)response.textContent=`Занятие закончено: ${p.review.length} слов в практике, ${p.fresh.length} новых. ${first?"В корзинке появилось угощение.":"Сегодняшняя встреча уже отмечена."}`;
}
function tomorrowText(){
  const n=startedList().filter(i=>W(i).due===addDays(today(),1)).length;
  return n?`Завтра вас ждут ${plural(n,"слово","слова","слов")} на повторение.`:"Следующее занятие подберём, когда ты вернёшься.";
}
function journeyHeroHtml(){
  const p=journeyState().plan, done=p?.day===today()&&p.done;
  return `<button class="btn block huge" id="hJourney" ${done?"disabled":""}>${done?"Занятие на сегодня завершено":p?.day===today()?"Продолжить занятие":"Занятие на сегодня"}</button><p class="small muted" style="text-align:center">${done?tomorrowText():"До 8 слов на повторение → 5 новых → разбор ошибок"}</p>`;
}
