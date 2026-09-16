// Готовое занятие, лиса-компаньон и постоянная коллекция учебных наград.
const FOX_REWARDS = [
  {id:"hello",icon:"🍃",name:"Первый лист",desc:"Завершить первое занятие",at:1},
  {id:"three",icon:"🧣",name:"Тёплый шарф",desc:"Заниматься в три разных дня",at:3},
  {id:"seven",icon:"🏮",name:"Лесной фонарь",desc:"Заниматься в семь разных дней",at:7},
  {id:"fourteen",icon:"🫖",name:"Вечерний чай",desc:"Заниматься в четырнадцать разных дней",at:14},
  {id:"thirty",icon:"🏡",name:"Дом для лисы",desc:"Заниматься в тридцать разных дней",at:30}
];
// Лиса v2: видеопетли VP9 с альфа-каналом (art/companion-v2), четыре реакции у доступных лис.
// Прежние названия анимаций из действий и настроений сводятся к этим четырём состояниям.
const FOX_V2_DIR = "art/companion-v2";
const FOX_V2_STATE = {idle:"idle",quiet:"idle",sad:"idle",withdrawn:"idle",sleep:"idle",hungry:"idle",thirsty:"idle",lesson:"idle",stretch:"idle",yawn:"idle",listen:"look",offended:"look",pet:"blink",feed:"blink",happy:"blink",drink:"notice",notice:"notice",look:"look",blink:"blink"};
const FOX_AMBIENT_MS = [[5000,9000],[9000,15000]]; // паузы между реакциями: настроение 0 и 1; при 2–3 реакций нет
const foxReducedMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const foxStill = () => foxReducedMotion() || S.set?.motion===false;
const foxMoodAnimation = mood => ["idle","quiet","sad","withdrawn"][mood] || "idle";
const foxCurrent = () => LearningCore.petFox(S.companion?.fox);
const foxReady = () => !!(foxCurrent() && foxIdentity().name);
const foxAsset = (fox,state) => `${FOX_V2_DIR}/${fox.id}/${state}.webm`;
const foxPoster = fox => `${FOX_V2_DIR}/${fox.id}/poster.webp`;
function foxSceneHtml(){
  return foxStill() ? `<img class="fox-scene" src="${FOX_V2_DIR}/scene/forest.webp" alt="">` : `<video class="fox-scene" src="${FOX_V2_DIR}/scene/forest.webm" poster="${FOX_V2_DIR}/scene/forest.webp" autoplay muted loop playsinline disablepictureinpicture></video>`;
}
function foxActorHtml(fox,alt){
  if(foxStill())return `<img class="fox-clip on" src="${foxPoster(fox)}" alt="${esc(alt)}">`;
  return fox.states.map(state=>`<video class="fox-clip ${state==="idle"?"on":""}" data-state="${state}" src="${foxAsset(fox,state)}" ${state==="idle"?"autoplay loop":"hidden"} muted playsinline preload="auto" disablepictureinpicture aria-label="${esc(alt)}"></video>`).join("");
}
function foxStageHtml(fox,mood,alt){
  return `<div class="fox-stage mood-${mood}" id="foxStage" data-mood="${mood}">${foxSceneHtml()}<div class="fox-actor">${foxActorHtml(fox,alt)}</div></div>`;
}
let foxAnimationTimer = 0;
function foxClips(){return [...document.querySelectorAll("#foxStage .fox-clip[data-state]")];}
const FOX_FADE_MS = 0; // кроссфейд отключён: наложение двух полупрозрачных краёв даёт ореол вокруг лисы
let foxFadeTimer = 0;
// Переключение клипов: новый запускается с кадра покоя поверх старого и проявляется за 160 мс,
// старый останавливается после кроссфейда — так гасится разница поз между дублями.
function foxShow(state){
  const clips=foxClips(); if(!clips.length)return null;
  const clip=clips.find(c=>c.dataset.state===state)||clips.find(c=>c.dataset.state==="idle");
  const current=clips.find(c=>c.classList.contains("on")&&c!==clip);
  clearTimeout(foxFadeTimer);
  try{clip.currentTime=0;}catch(e){}
  clip.hidden=false; clip.style.zIndex="2"; clip.play?.().catch?.(()=>{});
  const drop=c=>{c.classList.remove("on");c.hidden=true;c.pause();c.style.zIndex="";};
  requestAnimationFrame(()=>{clip.classList.add("on");if(current&&!FOX_FADE_MS)drop(current);});
  for(const c of clips)if(c!==clip&&c!==current)drop(c);
  if(current){current.style.zIndex="1";if(FOX_FADE_MS)foxFadeTimer=setTimeout(()=>drop(current),FOX_FADE_MS+20);}
  return clip;
}
// Реакция должна начаться на границе петли покоя, иначе поза «прыгает» посреди вдоха.
function foxAtLoopStart(clip,callback,limitMs=7000){
  const started=performance.now();
  const tick=()=>{
    if(!clip.isConnected)return;
    const t=clip.currentTime, d=clip.duration||0;
    if(clip.paused||!d||t<0.09||t>d-0.06||performance.now()-started>limitMs)callback();
    else requestAnimationFrame(tick);
  };
  tick();
}
function foxAmbientSchedule(){
  clearTimeout(foxAnimationTimer); foxAnimationTimer=0;
  const stage=$("#foxStage"); if(!stage||foxStill())return;
  const mood=Number(stage.dataset.mood)||0, range=FOX_AMBIENT_MS[mood]; if(!range)return;
  const states=foxCurrent()?.states.filter(s=>s!=="idle")||[]; if(!states.length)return;
  foxAnimationTimer=setTimeout(()=>{
    if(!stage.isConnected||document.hidden){foxAmbientSchedule();return;}
    playFoxAnimation(states[Math.floor(Math.random()*states.length)],mood);
  },range[0]+Math.random()*(range[1]-range[0]));
}
function playFoxAnimation(animation,mood){
  clearTimeout(foxAnimationTimer); foxAnimationTimer=0;
  const state=FOX_V2_STATE[animation]||"idle";
  const clips=foxClips(); if(!clips.length)return;
  if(state==="idle"){foxShow("idle");foxAmbientSchedule();return;}
  const idle=clips.find(c=>c.dataset.state==="idle"&&c.classList.contains("on")&&!c.paused);
  const busy=clips.find(c=>c.dataset.state!=="idle"&&c.classList.contains("on")&&!c.paused&&!c.ended);
  const start=()=>{
    const clip=foxShow(state); if(!clip)return;
    clip.onended=()=>{clip.onended=null; if(!clip.isConnected)return; const next=clip.dataset.next; delete clip.dataset.next; if(next)playFoxAnimation(next,mood); else {foxShow("idle"); foxAmbientSchedule();}};
  };
  // Реакция не прерывает другую посреди движения: она встанет в очередь и начнётся с кадра покоя.
  if(busy){busy.dataset.next=state;return;}
  if(idle)foxAtLoopStart(idle,start); else start();
}
function journeyState(){
  S.journey = S.journey || {completed:{},rewards:{}};
  S.companion = S.companion || LearningCore.petEmpty();
  S.companion.identity = LearningCore.petIdentity(S.companion.identity);
  return S.journey;
}
const foxIdentity = () => LearningCore.petIdentity(S.companion?.identity);
const foxMale = () => foxIdentity().sex === "male";
const foxWho = (form="nom") => LearningCore.petTerm(S.companion,form);
const foxWhoCap = (form="nom") => {const value=foxWho(form);return value?value[0].toLocaleUpperCase("ru-RU")+value.slice(1):value;};
const foxPronoun = () => foxMale()?"он":"она";
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
  const male=foxMale(), who=foxWhoCap(), pronoun=foxPronoun();
  const moods = [male?"Рад тебя видеть":"Рада тебя видеть", male?"Притих":"Притихла", "Скучает по тебе", male?"Свернулся клубком":"Свернулась клубком"];
  const texts = [p.last === today() ? `Сегодня мы уже позанимались. ${who} рад${male?"":"а"}, что ты заглянул!` : p.last ? "У нас есть несколько слов для короткого занятия." : `${who} теперь твой компаньон. Давай начнём с пяти слов?`, `Один день без занятия. ${who} ждёт вашей следующей встречи.`, `Два дня без занятия. На ласку ${pronoun} отвечает лишь движением ушек.`, "Три дня или больше без занятия. Еда и ласка пока не помогают — начните урок вместе."];
  const total = Object.keys(j.completed).length, next = FOX_REWARDS.find(r=>!j.rewards[r.id]);
  const week = Array.from({length:7},(_,i)=>addDays(today(),i-6));
  const weekly = week.filter(d=>j.completed[d]).length;
  return `<section class="card companion" id="companionCard">
    <div class="row between fox-card-head"><div class="eyebrow">${male?"Твой":"Твоя"} ${esc(foxWho())}</div><div class="fox-card-tools"><button class="btn ghost small" id="foxIdentity">Имя и образ</button><button class="btn ghost small" id="foxCollection">Коллекция · ${Object.keys(j.rewards).length}/${FOX_REWARDS.length}</button></div></div>
    <div class="fox-meeting">${foxStageHtml(foxCurrent(),p.mood,`${who}: ${moods[p.mood]}`)}<div><h2>${moods[p.mood]}</h2><p class="small muted">${esc(texts[p.mood])}</p></div></div>
    <p class="small muted fox-beta">Бета-версия компаньона: пока четыре базовые реакции. Позже будут открываться новые взаимодействия, предметы и домики.</p>
    <p class="small fox-response" id="foxResponse" role="status" aria-live="polite">${memoryCount() ? `Сегодня ты вспомнил ${plural(memoryCount(),"слово","слова","слов")} после перерыва.` : "Вода всегда доступна. Первое занятие дня приносит одно угощение."}</p>
    <div class="fox-actions"><button class="btn secondary" id="foxFeed" ${p.mood===3 || !p.treats ? "disabled":""}>Угостить · ${p.treats}</button><button class="btn secondary" id="foxWater" ${p.mood===3?"disabled":""}>Напоить</button><button class="btn secondary" id="foxPet" ${p.mood===3?"disabled":""}>Погладить</button></div>
    <div class="fox-week" aria-label="Занятия за последние семь дней">${week.map(d=>`<span class="${j.completed[d]?"done":""}" title="${d}">${j.completed[d]?"✓":"·"}</span>`).join("")}<b>${weekly}/4 дня</b></div>
    <p class="small muted">${weekly>=4?"Недельная цель выполнена. Можно отдохнуть или продолжить в своём темпе.":"Цель — четыре дня занятий за последние семь. Не обязательно подряд."}</p>
    ${window.pinCompanion?'<button class="btn ghost small" id="foxPin">Добавить лису на рабочий стол</button>':""}
    ${next?`<p class="small" style="margin-top:8px">${next.icon} До награды «${next.name}» — ${plural(Math.max(0,next.at-total),"день занятий","дня занятий","дней занятий")}.</p>`:`<p class="small">Вся коллекция собрана. Лиса остаётся рядом!</p>`}
  </section>`;
}
function foxFaceIcon(){return `<img src="${FOX_V2_DIR}/handle.png" alt="" draggable="false">`;}
const foxSexBadge = sex => sex==="male" ? `<span class="fox-sex male" title="Лис">♂ Лис</span>` : `<span class="fox-sex female" title="Лиса">♀ Лиса</span>`;
// Выбор спутника: доступные лисы показывают петлю покоя, остальные — приглушённую карточку. Имя задаётся один раз.
function companionChooserHtml(){
  const identity=foxIdentity(), adopted=!!S.companion.adopted&&!!identity.name, selected=foxCurrent()?.id||"";
  return `<section class="card companion fox-choose" id="companionChooser">
    <div class="eyebrow">Компаньон · бета</div><h2>${adopted?"Другая лиса":"Выбери спутника"}</h2>
    <p class="small muted">Бета-версия компаньона: пока у лис четыре базовые реакции. Позже будут открываться новые взаимодействия, предметы и домики.</p>
    <div class="fox-grid" role="radiogroup" aria-label="Лисы">${LearningCore.petFoxes.map(fox=>`<button type="button" class="fox-option ${fox.id===selected?"on":""} ${fox.available?"":"locked"}" data-fox="${fox.id}" role="radio" aria-checked="${fox.id===selected}" ${fox.available?"":"disabled"}>
      <span class="fox-option-art">${fox.available&&!foxStill()?`<video src="${foxAsset(fox,"idle")}" poster="${foxPoster(fox)}" autoplay muted loop playsinline disablepictureinpicture></video>`:`<img src="${foxPoster(fox)}" alt="">`}</span>
      ${foxSexBadge(fox.sex)}<b>${esc(fox.title)}</b><small>${fox.available?(fox.sex==="male"?"Доступен сразу":"Доступна сразу"):"Будет добавлено позднее"}</small></button>`).join("")}</div>
    <label class="fox-choose-name"><span>${adopted?"Имя остаётся прежним":"Постоянное имя"}</span><input class="fox-name-input" id="foxChooseName" maxlength="32" autocomplete="off" value="${esc(identity.name)}" placeholder="Например, Луна или Фокс" ${adopted?"readonly":""}></label>
    <p class="small muted">${adopted?"Имя даётся один раз. Падежные формы можно поправить в «Имя и образ».":"Имя даётся один раз и потом не меняется. Падежные формы можно будет поправить в «Имя и образ»."}</p>
    <div class="grid2"><button class="btn block" id="foxAdopt" ${selected&&identity.name?"":"disabled"}>${adopted?"Выбрать эту лису":"Позвать"}</button>${adopted?`<button class="btn secondary block" id="foxChooseBack">Назад</button>`:""}</div>
  </section>`;
}
function wireCompanionChooser(){
  const host=$("#companionChooser"); if(!host)return;
  let selected=foxCurrent()?.id||"";
  const refresh=()=>{
    host.querySelectorAll(".fox-option").forEach(b=>{b.classList.toggle("on",b.dataset.fox===selected);b.setAttribute("aria-checked",String(b.dataset.fox===selected));});
    $("#foxAdopt").disabled=!(selected&&$("#foxChooseName").value.trim());
  };
  host.querySelectorAll(".fox-option:not([disabled])").forEach(b=>b.onclick=()=>{selected=b.dataset.fox;refresh();});
  $("#foxChooseName").oninput=refresh;
  if($("#foxChooseBack"))$("#foxChooseBack").onclick=()=>{closeCompanion();openCompanion();};
  $("#foxAdopt").onclick=()=>{
    const fox=LearningCore.petFox(selected); if(!fox||!fox.available)return;
    const adopted=!!S.companion.adopted&&!!foxIdentity().name;
    const name=adopted?foxIdentity().name:$("#foxChooseName").value.trim(); if(!name)return;
    const commit=()=>{
      const keepForms=adopted&&foxIdentity().sex===fox.sex;
      S.companion.fox=fox.id; S.companion.adopted=S.companion.adopted||today();
      S.companion.identity=LearningCore.petIdentity({sex:fox.sex,name,decline:keepForms?foxIdentity().decline:true,forms:keepForms?foxIdentity().forms:LearningCore.petNameForms(name,fox.sex,true)});
      save(); if(window.syncCompanion)window.syncCompanion(); closeCompanion(); openCompanion({celebrate:true});
    };
    if(adopted)commit();
    else confirmSheet(`Позвать ${fox.sex==="male"?"лиса":"лису"} по имени ${name}?`,"Имя останется навсегда — изменить его потом нельзя. Падежные формы можно будет поправить.","Позвать",commit);
  };
}
function openCompanion(options={}){
  journeyState();
  const host=$("#foxDrawerHost"); if(!host)return;
  const choose=options.choose||!foxReady();
  host.innerHTML=`<div class="fox-drawer-scrim"><aside class="fox-drawer" role="dialog" aria-modal="true" aria-labelledby="foxDrawerTitle"><div class="fox-drawer-head"><div><div class="eyebrow">Компаньон</div><h2 id="foxDrawerTitle">${choose&&!foxReady()?"Новый спутник":`Домик ${esc(foxWho("gen"))}`}</h2></div><button class="icon-btn" id="foxDrawerClose" aria-label="Закрыть">${ICONS.close}</button></div>${journeyHeroHtml()}${choose?companionChooserHtml():companionCardHtml()}</aside></div>`;
  document.body.classList.add("fox-drawer-open");
  $("#foxDrawerClose").onclick=closeCompanion;
  $(".fox-drawer-scrim").onclick=e=>{if(e.target===e.currentTarget)closeCompanion();};
  if($("#hJourney"))$("#hJourney").onclick=journeyStart;
  if(choose){wireCompanionChooser();$("#foxDrawerClose").focus();return;}
  wireCompanion();
  const mood=LearningCore.petMood(S.companion,today()).mood;
  if(options.celebrate)playFoxAnimation("happy",mood);
  else if(mood<=1)playFoxAnimation("notice",mood);
  $("#foxDrawerClose").focus();
}
function closeCompanion(){
  clearTimeout(foxAnimationTimer); foxAnimationTimer=0;
  const host=$("#foxDrawerHost");if(host){host.querySelectorAll("video").forEach(v=>{v.pause();v.removeAttribute("src");v.load();});host.innerHTML="";}
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
  const male=foxMale(), who=foxWhoCap();
  sheet(`<div class="row between"><h2>Сокровища ${esc(foxWho("gen"))}</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div><p class="muted">Память о ваших занятиях. Пропуски не отнимают награды.</p><div class="fox-rewards">${FOX_REWARDS.map(r=>`<div class="card ${j.rewards[r.id]?"earned":""}"><span class="reward-icon">${r.icon}</span><b>${r.name}</b><p class="small muted">${r.desc}</p><span class="small">${j.rewards[r.id]?`Получено ${j.rewards[r.id]}`:"Ещё впереди"}</span></div>`).join("")}</div><p class="small muted">После первого полного пропущенного дня ${esc(who)} притихает, после второго грустит, после третьего не реагирует на еду и ласку. Одно завершённое занятие возвращает ${male?"его":"её"} к общению.</p>`);
}
function companionIdentitySheet(draft){
  journeyState();
  const identity=LearningCore.petIdentity(draft||foxIdentity()), suggested=LearningCore.petNameForms(identity.name,identity.sex,identity.decline);
  const labels={gen:"Кого?",dat:"Кому?",acc:"Кого?",ins:"Кем?",prep:"О ком?"};
  const fox=foxCurrent(), adopted=!!S.companion.adopted&&!!foxIdentity().name;
  sheet(`<div class="row between"><div><div class="eyebrow">Компаньон</div><h2>Имя и образ</h2></div><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div>
    <p class="muted">${adopted?"Имя постоянное, а падежные формы можно поправить: они появляются в репликах и виджете.":"Дай компаньону имя. Оно сохранится вместе с прогрессом и появится в репликах и виджете."}</p>
    <div class="fox-identity-form">
      <div class="fox-identity-fox"><img src="${fox?foxPoster(fox):""}" alt="">${fox?`<div>${foxSexBadge(fox.sex)}<b>${esc(fox.title)}</b></div>`:""}<button class="btn ghost small" id="foxChange">Другая лиса</button></div>
      <label><span>Имя</span><input class="fox-name-input" id="foxName" maxlength="32" autocomplete="off" value="${esc(identity.name)}" placeholder="Например, Луна или Фокс" ${adopted?"readonly":""}></label>
      <label class="fox-decline"><input type="checkbox" id="foxDecline" ${identity.decline?"checked":""}><span>Склонять имя в русских фразах</span></label>
      <div class="row between"><span class="small muted">Предложенные формы можно исправить вручную.</span><button class="btn ghost small" id="foxSuggest">Предложить формы</button></div>
      <div class="fox-name-forms">${Object.entries(labels).map(([key,label])=>`<label><span>${label}</span><input class="fox-name-input" data-fox-form="${key}" maxlength="32" value="${esc(identity.forms[key]||suggested[key])}" placeholder="${esc(suggested[key])}"></label>`).join("")}</div>
      <button class="btn block" id="foxIdentitySave">Сохранить</button>
    </div>`);
  $("#foxChange").onclick=()=>{closeSheet();closeCompanion();openCompanion({choose:true});};
  $("#foxSuggest").onclick=()=>{
    const forms=LearningCore.petNameForms($("#foxName").value,identity.sex,$("#foxDecline").checked);
    document.querySelectorAll("[data-fox-form]").forEach(input=>input.value=forms[input.dataset.foxForm]);
  };
  $("#foxName").oninput=()=>$("#foxSuggest").click();
  $("#foxDecline").onchange=()=>$("#foxSuggest").click();
  $("#foxIdentitySave").onclick=()=>{
    const name=adopted?foxIdentity().name:$("#foxName").value, decline=$("#foxDecline").checked;
    const forms=Object.fromEntries([...document.querySelectorAll("[data-fox-form]")].map(input=>[input.dataset.foxForm,input.value]));
    S.companion.identity=LearningCore.petIdentity({sex:identity.sex,name,decline,forms:decline?forms:LearningCore.petNameForms(name,identity.sex,false)});
    save(); if(window.syncCompanion)window.syncCompanion(); closeSheet(); closeCompanion(); openCompanion();
  };
}
async function companionAct(action){
  const buttons = [$("#foxFeed"),$("#foxWater"),$("#foxPet")]; buttons.forEach(b=>{if(b)b.disabled=true;});
  try {
    journeyState();
    const result = window.nativeCompanionAction ? await window.nativeCompanionAction(action) : LearningCore.petAction(S.companion,action,today());
    S.companion = result.state; save();
    const mood=LearningCore.petMood(S.companion,today()).mood;
    const response=$("#foxResponse"); if(response)response.textContent=result.message;
    const feed=$("#foxFeed"); if(feed){feed.textContent=`Угостить · ${LearningCore.petMood(S.companion,today()).treats}`;feed.disabled=mood===3||!LearningCore.petMood(S.companion,today()).treats;}
    const water=$("#foxWater");if(water)water.disabled=mood===3;
    const pet=$("#foxPet");if(pet)pet.disabled=mood===3;
    playFoxAnimation(mood===2?"offended":action==="water"?"drink":action,mood);
  } catch(e) { toast("Не удалось сохранить действие. Попробуй ещё раз."); if(tab==="home"&&!inSession)renderHome(); }
}
function wireCompanion(){
  if($("#foxFeed"))$("#foxFeed").onclick=()=>companionAct("feed"); if($("#foxWater"))$("#foxWater").onclick=()=>companionAct("water"); if($("#foxPet"))$("#foxPet").onclick=()=>companionAct("pet"); if($("#foxCollection"))$("#foxCollection").onclick=companionCollection;
  if($("#foxIdentity"))$("#foxIdentity").onclick=()=>companionIdentitySheet();
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
