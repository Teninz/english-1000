// Готовое занятие, лиса-компаньон и постоянная коллекция учебных наград.
const FOX_REWARDS = [
  {id:"hello",icon:"🍃",name:"Первый лист",desc:"Завершить первое занятие",at:1},
  {id:"three",icon:"🧣",name:"Тёплый шарф",desc:"Заниматься в три разных дня",at:3},
  {id:"seven",icon:"🏮",name:"Лесной фонарь",desc:"Заниматься в семь разных дней",at:7},
  {id:"fourteen",icon:"🫖",name:"Вечерний чай",desc:"Заниматься в четырнадцать разных дней",at:14},
  {id:"thirty",icon:"🏡",name:"Дом для лисы",desc:"Заниматься в тридцать разных дней",at:30}
];
// Лиса v2: набор клипов VP9 с альфа-каналом из art/companion-v2 (описание — FOX_PACK из manifest.js).
// Каждый клип начинается и заканчивается каноническим кадром покоя или сна, поэтому клипы
// стыкуются в любом порядке. Плеер держит два <video>: пока один играет, во второй грузится следующий.
const FOX_V2_DIR = "art/companion-v2";
const foxPack = () => (typeof FOX_PACK !== "undefined" ? FOX_PACK : {fps:24,foxes:{},scene:{periods:{},transitions:{}}});
const foxPackFox = fox => foxPack().foxes[fox?.id] || {clips:{}};
// В APK клипы не упакованы: их скачивает и хранит native.js (window.foxPackStore), пока набора нет — постеры.
// На сайте файлы лежат рядом с приложением, хранилище не нужно.
const foxPackReady = () => !window.foxPackStore || window.foxPackStore.ready();
const foxPackUrl = path => window.foxPackStore ? window.foxPackStore.url(path) : `${FOX_V2_DIR}/${path}`;
// Список файлов набора: [{path, kb}] — по нему идут загрузка, проверка и подсчёт размера.
function foxPackFiles(){
  const pack=foxPack(), files=[];
  for(const [fox,f] of Object.entries(pack.foxes||{}))for(const [clip,c] of Object.entries(f.clips||{}))files.push({path:`${fox}/${clip}.webm`,kb:c.kb||0});
  // Сцена (петли и переходы фона) лежит внутри APK и в набор не входит.
  return files;
}
const foxPackMb = () => Math.max(1,Math.round(foxPackFiles().reduce((s,f)=>s+f.kb,0)/1024));
const foxClipNames = fox => foxPackReady() ? Object.keys(foxPackFox(fox).clips || {}) : [];
// Время суток по часам устройства: 07:30 утро, 12:30 день, 19:30 вечер, 23:30 ночь.
const FOX_PERIOD_ORDER = ["morning","day","evening","night"];
const FOX_PERIOD_NAMES = {morning:"утро",day:"день",evening:"вечер",night:"ночь"};
function foxPeriod(date=new Date()){
  const m=date.getHours()*60+date.getMinutes();
  if(m<450||m>=1410)return "night";
  if(m<750)return "morning";
  if(m<1170)return "day";
  return "evening";
}
const foxPeriodTransition = (from,to) => FOX_PERIOD_ORDER.indexOf(to)===(FOX_PERIOD_ORDER.indexOf(from)+1)%4 ? `${from}-${to}` : null;
// Наборы клипов по настроению (manifest: foxes[id].sets): петля покоя, «сюжетные» вставки и реакция на касание.
// 0 пропущенных дней — calm, 1–2 — sad, 3 и больше — offended. Сон ночью — в любом настроении.
const foxMoodSet = mood => mood >= 3 ? "offended" : mood >= 1 ? "sad" : "calm";
function foxSet(name){
  const sets=foxPackFox(foxCurrent()).sets||{}, set=sets[name]||sets.calm||{idle:null,active:[],touch:null};
  const has=clip=>clip&&foxHasClip(foxCurrent(),clip);
  return {idle:has(set.idle)?set.idle:null, active:(set.active||[]).filter(has), touch:has(set.touch)?set.touch:null};
}
const FOX_IDLE_RUNS = [2, 5]; // сколько кругов петли покоя между вставками (петля ≈ 4–5 с)
const foxReducedMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const foxStill = () => foxReducedMotion() || S.set?.motion===false;
const foxMoodAnimation = mood => ["idle","quiet","sad","withdrawn"][mood] || "idle";
const foxCurrent = () => LearningCore.petFox(S.companion?.fox);
const foxReady = () => !!(foxCurrent() && foxIdentity().name);
const foxAsset = (fox,clip) => foxPackUrl(`${fox.id}/${clip}.webm`);
const foxPoster = (fox,kind="") => `${FOX_V2_DIR}/${fox.id}/poster${kind?"-"+kind:""}.webp`;
const foxSceneLoops = period => (foxPack().scene?.periods?.[period]||[]).map(x=>x.file);
const foxSceneSrc = file => `${FOX_V2_DIR}/scene/${file}.webm`;
const foxScenePoster = period => `${FOX_V2_DIR}/scene/${period}.webp`;
const foxHasClip = (fox,clip) => foxPackReady() && !!foxPackFox(fox).clips?.[clip];
const foxPreviewClip = fox => foxHasClip(fox,"calm1") ? "calm1" : foxClipNames(fox)[0] || null;

const foxPrevPeriod = period => FOX_PERIOD_ORDER[(FOX_PERIOD_ORDER.indexOf(period)+3)%4];
// Смена времени суток показывается при открытии панели, если с прошлого визита период изменился
// (утром открыл, вечером вернулся — идёт переход день→вечер). Повторное открытие в том же периоде — без перехода.
function foxOpenTransition(period){
  const seen=journeyState().foxSeen?.period||null;
  if(!seen||seen===period)return null;
  return {seen,hop:foxPeriodTransition(seen,period)?seen:foxPrevPeriod(period)};
}
function foxStageHtml(fox,mood,alt){
  const period=foxPeriod(), change=foxOpenTransition(period), hasSleep=foxHasClip(fox,"sleep"), set=foxMoodSet(mood);
  // Спит, если сейчас ночь и переходить не нужно, либо если прошлый визит был ночью — тогда проснётся на глазах.
  const asleep=hasSleep&&(change?change.seen==="night":period==="night");
  const posterKind=asleep?"sleep":set==="calm"?"":set;
  const loops=foxSceneLoops(period), loop=loops[Math.floor(Math.random()*loops.length)];
  const transition=change&&foxPack().scene?.transitions?.[`${change.hop}-${period}`]?`${change.hop}-${period}`:null;
  const scene=foxStill()||!loop
    ? `<img class="fox-scene on" src="${foxScenePoster(period)}" alt="">`
    : `<video class="fox-scene on" src="${transition?foxSceneSrc(transition):foxSceneSrc(loop)}" poster="${foxScenePoster(transition?change.hop:period)}" autoplay muted ${transition?"":"loop"} playsinline disablepictureinpicture></video><video class="fox-scene" muted playsinline preload="auto" disablepictureinpicture ${transition?`src="${foxSceneSrc(loop)}" loop`:""}></video>`;
  const actor=foxStill()||!foxClipNames(fox).length
    ? `<img class="fox-clip on" src="${foxPoster(fox,posterKind)}" alt="${esc(alt)}">`
    : `<video class="fox-clip" muted playsinline preload="auto" disablepictureinpicture aria-label="${esc(alt)}" poster="${foxPoster(fox,posterKind)}"></video><video class="fox-clip" muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>`;
  return `<div class="fox-stage mood-${mood}" id="foxStage" data-mood="${mood}" data-period="${period}" data-mode="${asleep?"asleep":"awake"}" data-set="${set}" data-zoom="${asleep?"in":"out"}" data-from="${change?change.seen:""}" data-transition="${transition||""}" title="${FOX_PERIOD_NAMES[period]}">${scene}<div class="fox-actor">${actor}</div></div>`;
}

// --- плеер ---
const foxPlayer = {videos:[],active:null,current:null,last:null,planned:null,queue:[],timer:0,periodTimer:0,idleRuns:0,idleTarget:3};
function foxPlayerReset(){
  clearTimeout(foxPlayer.timer); clearInterval(foxPlayer.periodTimer);
  foxPlayer.videos=[]; foxPlayer.active=null; foxPlayer.current=null; foxPlayer.last=null; foxPlayer.queue=[]; foxPlayer.planned=null; foxPlayer.timer=0; foxPlayer.periodTimer=0; foxResetIdleRuns();
}
function foxPlayerStart(){
  foxPlayerReset();
  const stage=$("#foxStage"); if(!stage)return;
  const period=stage.dataset.period, from=stage.dataset.from||null;
  const j=journeyState();
  if(!j.foxSeen||j.foxSeen.period!==period||j.foxSeen.day!==today()){j.foxSeen={day:today(),period};save();}
  // Переход фона уже стоит первым клипом; после него включается петля текущего периода.
  const scenes=[...stage.querySelectorAll("video.fox-scene")];
  if(stage.dataset.transition&&scenes.length===2){
    scenes[0].onended=()=>{scenes[1].classList.add("on");scenes[1].play?.().catch?.(()=>{});scenes[0].classList.remove("on");scenes[0].pause();};
  }
  foxPlayer.videos=[...stage.querySelectorAll("video.fox-clip")];
  stage.querySelectorAll("video").forEach(v=>{v.onerror=()=>{const e=v.error;if(window.foxPackMediaError){window.foxPackMediaError((v.currentSrc||v.src||"").split("/").pop().slice(0,40),e?e.code:"?",e?.message);foxPackRefresh();}};});
  if(foxPlayer.videos.length<2)return;
  stage.onclick=()=>foxTouch();
  if(from&&from!==period){if(period==="night")foxGoToSleep();else if(from==="night")foxWakeUp();}
  foxPlayNext();
  foxPlayer.periodTimer=setInterval(foxCheckPeriod,30000);
  foxPlayer.timer=setTimeout(foxMediaCheck,5000);
}
// Если через 5 с после открытия видео так и не пошло — состояние каждого элемента и версия WebView
// показываются прямо в панели (только в приложении), чтобы причину было видно без отладки.
function foxMediaCheck(){
  const stage=foxStage(); if(!stage||!stage.isConnected||typeof NATIVE==="undefined"||!NATIVE)return;
  const videos=[...stage.querySelectorAll("video.on")]; if(!videos.length)return;
  const bad=videos.filter(v=>v.paused||v.readyState<3||v.error);
  if(!bad.length)return;
  const ua=(navigator.userAgent.match(/Chrome\/[\d.]+/)||[""])[0];
  const parts=videos.map(v=>`${v.classList.contains("fox-scene")?"фон":"лиса"} ${(v.currentSrc||v.src||"").split("/").pop().slice(0,28)}: rs${v.readyState} ns${v.networkState} ${v.paused?"пауза":"играет"} t${v.currentTime.toFixed(1)}${v.error?" err"+v.error.code+(v.error.message?" "+v.error.message.slice(0,50):""):""}`);
  const line=`Проверка видео: ${parts.join(" · ")} · ${ua||"WebView ?"}`;
  let el=$("#foxMediaReport");
  if(!el){el=document.createElement("p");el.id="foxMediaReport";el.className="small";el.style.cssText="color:var(--bad);margin:0 0 10px;overflow-wrap:anywhere";const beta=$(".fox-beta");if(beta)beta.after(el);else stage.after(el);}
  el.textContent=line;
}
const foxStage = () => $("#foxStage");
// Система останавливает видео в свёрнутом приложении; при возврате запускаем активные клипы заново.
document.addEventListener("visibilitychange",()=>{
  if(document.hidden)return;
  const stage=foxStage(); if(!stage)return;
  stage.querySelectorAll("video.on").forEach(v=>{if(v.paused&&!v.ended)v.play?.().catch?.(()=>{});});
  if(foxPlayer.active&&foxPlayer.active.ended)foxPlayNext();
});
const foxMode = () => foxStage()?.dataset.mode||"awake";
function foxSetMode(mode){
  const s=foxStage(); if(!s)return; s.dataset.mode=mode;
  const set=s.dataset.set||"calm";
  const img=s.querySelector("img.fox-clip"); if(img)img.src=foxPoster(foxCurrent(),mode==="asleep"?"sleep":set==="calm"?"":set);
}
// Наезд «камеры»: фон плавно приближается на протяжении клипа lie-down и отдаляется на wake-up.
function foxCameraFor(clip){
  const stage=foxStage(); if(!stage)return;
  const ms=foxPackFox(foxCurrent()).clips?.[clip]?.ms||0;
  if(clip==="lie-down"){stage.style.setProperty("--fox-zoom-ms",`${ms}ms`);stage.dataset.zoom="in";}
  else if(clip==="wake-up"){stage.style.setProperty("--fox-zoom-ms",`${ms}ms`);stage.dataset.zoom="out";}
}
// Что играть следующим, если очередь пуста: во сне — петля сна, наяву — случайный спокойный клип.
function foxAutoClip(){
  const fox=foxCurrent(); if(!fox)return null;
  if(foxMode()==="asleep")return foxHasClip(fox,"sleep")?"sleep":null;
  const set=foxSet(foxStage()?.dataset.set||"calm");
  const idleDue=foxPlayer.idleRuns<foxPlayer.idleTarget;
  if(set.idle&&(idleDue||!set.active.length))return set.idle;
  if(!set.active.length)return set.idle;
  const pool=set.active.length>1?set.active.filter(n=>n!==foxPlayer.last):set.active;
  return pool[Math.floor(Math.random()*pool.length)];
}
const foxResetIdleRuns = () => {foxPlayer.idleRuns=0;foxPlayer.idleTarget=FOX_IDLE_RUNS[0]+Math.floor(Math.random()*(FOX_IDLE_RUNS[1]-FOX_IDLE_RUNS[0]+1));};
function foxPlayNext(){
  const fox=foxCurrent(); if(!fox||!foxPlayer.videos.length)return;
  const item=foxPlayer.queue.shift();
  let name=item?item.clip:foxPlayer.planned;
  if(!item&&(!name||(name==="sleep")!==(foxMode()==="asleep")))name=foxAutoClip();
  foxPlayer.planned=null;
  if(!name)return;
  const idle=foxPlayer.videos.find(v=>v!==foxPlayer.active)||foxPlayer.videos[0];
  const src=foxAsset(fox,name);
  if(!idle.src.endsWith(src)){idle.src=src;idle.load();}
  const previous=foxPlayer.active;
  const swap=()=>{
    try{idle.currentTime=0;}catch(e){}
    idle.classList.add("on"); idle.play?.().catch?.(()=>{});
    foxCameraFor(name);
    if(previous&&previous!==idle){previous.classList.remove("on");previous.pause();}
    foxPlayer.active=idle; foxPlayer.current=name;
    const set=foxSet(foxStage()?.dataset.set||"calm");
    if(name===set.idle)foxPlayer.idleRuns++; else if(set.active.includes(name)){foxPlayer.last=name;foxResetIdleRuns();}
    idle.onended=()=>{if(item?.then)item.then();foxPlayNext();};
    foxPrepareNext();
  };
  if(idle.readyState>=3)swap(); else idle.oncanplay=()=>{idle.oncanplay=null;swap();};
}
// Пока играет текущий клип, во второй <video> заранее грузится следующий — переключение без паузы.
function foxPrepareNext(){
  const fox=foxCurrent(), idle=foxPlayer.videos.find(v=>v!==foxPlayer.active); if(!fox||!idle)return;
  const planned=foxPlayer.queue[0]?.clip||foxAutoClip(); if(!planned)return;
  foxPlayer.planned=planned;
  const src=foxAsset(fox,planned);
  if(!idle.src.endsWith(src)){idle.src=src;idle.load();}
}
function foxQueue(clip,then){
  if(!foxHasClip(foxCurrent(),clip))return false;
  foxPlayer.queue.push({clip,then}); foxPrepareNext(); return true;
}
// Реакция не прерывает текущий клип: она встаёт в очередь и начнётся с кадра покоя.
function playFoxAnimation(animation){
  if(!foxPlayer.videos.length)return;
  if(foxMode()==="asleep"){foxQueue("sleep-touch");return;}
  if(animation==="sleep"){foxGoToSleep();return;}
  const set=foxSet(foxStage()?.dataset.set||"calm");
  const clip=(animation==="pet"&&set.touch)||(set.active.length?set.active.filter(n=>n!==foxPlayer.last)[0]||set.active[0]:null);
  if(clip)foxQueue(clip);
}
function foxTouch(){
  if(!foxPlayer.videos.length)return;
  if(foxPlayer.queue.length)return;
  playFoxAnimation(foxMode()==="asleep"?"sleep":"pet");
}
// Цепочки «ложится/засыпает» и «просыпается» сняты из спокойной позы: в грусти и обиде переключение жёсткое.
function foxGoToSleep(){
  if(foxMode()==="asleep")return;
  const fox=foxCurrent();
  if(!foxHasClip(fox,"sleep")){foxSetMode("asleep");return;}
  foxPlayer.queue=[];
  const calm=(foxStage()?.dataset.set||"calm")==="calm";
  if(calm&&foxHasClip(fox,"lie-down"))foxQueue("lie-down");
  if(calm&&foxHasClip(fox,"fall-asleep"))foxQueue("fall-asleep",()=>foxSetMode("asleep")); else {foxSetMode("asleep");foxCameraFor("lie-down");}
  foxPrepareNext();
}
function foxWakeUp(){
  if(foxMode()!=="asleep")return;
  const fox=foxCurrent();
  foxPlayer.queue=[];
  const calm=(foxStage()?.dataset.set||"calm")==="calm";
  if(calm&&foxHasClip(fox,"wake-up"))foxQueue("wake-up",()=>foxSetMode("awake")); else {foxSetMode("awake");foxCameraFor("wake-up");}
  foxPrepareNext();
}
// Смена времени суток при открытой панели: переход фона и смена режима лисы.
function foxCheckPeriod(){
  const stage=foxStage(); if(!stage||!stage.isConnected){clearInterval(foxPlayer.periodTimer);return;}
  const from=stage.dataset.period, to=foxPeriod(); if(from===to)return;
  stage.dataset.period=to; stage.title=FOX_PERIOD_NAMES[to];
  const j=journeyState(); j.foxSeen={day:today(),period:to}; save();
  foxSceneChange(from,to);
  if(to==="night")foxGoToSleep(); else if(from==="night")foxWakeUp();
}
function foxSceneChange(from,to){
  const stage=foxStage(); if(!stage)return;
  const scenes=[...stage.querySelectorAll("video.fox-scene")];
  const loops=foxSceneLoops(to), loop=loops[Math.floor(Math.random()*loops.length)];
  if(foxStill()||scenes.length<2){const img=stage.querySelector("img.fox-scene"); if(img)img.src=foxScenePoster(to); return;}
  const active=scenes.find(v=>v.classList.contains("on"))||scenes[0], idle=scenes.find(v=>v!==active);
  const swap=(el,src,loopFlag,onEnd)=>{
    el.loop=loopFlag; el.src=src; el.load();
    el.oncanplay=()=>{el.oncanplay=null; el.classList.add("on"); el.play?.().catch?.(()=>{}); active.classList.remove("on"); active.pause(); el.onended=onEnd||null;};
  };
  const transition=foxPeriodTransition(from,to);
  if(transition&&foxPack().scene?.transitions?.[transition]&&loop){
    swap(idle,foxSceneSrc(transition),false,()=>{
      active.loop=true; active.src=foxSceneSrc(loop); active.load();
      active.oncanplay=()=>{active.oncanplay=null; active.classList.add("on"); active.play?.().catch?.(()=>{}); idle.classList.remove("on"); idle.pause();};
    });
  } else if(loop) swap(idle,foxSceneSrc(loop),true);
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
// Блок загрузки набора анимаций (только в APK): кнопка с размером, прогресс, обновление и удаление.
function foxPackCardHtml(){
  const store=window.foxPackStore; if(!store)return "";
  const mb=foxPackMb(), st=store.status();
  if(st.state==="downloading")return `<div class="fox-pack" id="foxPack"><div class="row between"><b>Загружаем анимации…</b><span class="small muted" id="foxPackPct">${st.percent}%</span></div><div class="fox-pack-bar"><i style="width:${st.percent}%"></i></div><p class="small muted">Файлы сохраняются в памяти приложения; при обрыве загрузка продолжится с того же места.</p></div>`;
  if(st.state==="ready")return `<div class="fox-pack" id="foxPack"><div class="row between"><span class="small muted">Анимации загружены · ${mb} МБ</span><button class="btn ghost small" id="foxPackRemove">Удалить</button></div>${st.error?`<p class="small" style="color:var(--bad)">${esc(st.error)}</p>`:""}<div class="row between"><span class="small muted" id="foxProbeOut">${st.probe?esc(st.probe):"Если лиса не двигается — запусти проверку."}</span><button class="btn ghost small" id="foxProbe">Проверка видео</button></div></div>`;
  const update=st.state==="stale";
  return `<div class="fox-pack" id="foxPack"><b>${update?"Доступно обновление анимаций":"Анимации лисы не загружены"}</b><p class="small muted">${update?"Набор изменился — нужно скачать новые файлы.":"Клипы лисы и живой фон не входят в приложение, чтобы оно оставалось лёгким. Загрузка один раз, нужен интернет."}</p>${st.error?`<p class="small" style="color:var(--bad)">${esc(st.error)}</p>`:""}<button class="btn block" id="foxPackDownload">${update?"Обновить":"Загрузить"} · ${mb} МБ</button></div>`;
}
// Блок обновляется на месте, а панель перерисовывается только когда набор появился или удалён —
// с сохранением прокрутки, чтобы домик не «прыгал».
function foxPackRefresh(){
  const block=$("#foxPack"); if(!block)return;
  const wrap=document.createElement("div"); wrap.innerHTML=foxPackCardHtml(); const next=wrap.firstElementChild;
  if(next)block.replaceWith(next); else block.remove();
  wireFoxPack();
}
function foxDrawerRerender(){
  if(!companionDrawerOpen()||inSession||$(".scrim"))return;
  const top=$(".fox-drawer")?.scrollTop||0;
  closeCompanion(); openCompanion();
  const drawer=$(".fox-drawer"); if(drawer)drawer.scrollTop=top;
}
// Диагностика воспроизведения: один маленький клип четырьмя способами. Результат остаётся в блоке набора.
async function foxProbeRun(){
  const store=window.foxPackStore, out=$("#foxProbeOut"); if(!store)return;
  const say=text=>{if(out)out.textContent=text;if(store.setProbe)store.setProbe(text);};
  say("Проверяю…");
  const tryPlay=(label,src)=>new Promise(resolve=>{
    if(!src){resolve(`${label}: нет источника`);return;}
    const v=document.createElement("video"); v.muted=true; v.playsInline=true; v.setAttribute("playsinline",""); v.preload="auto"; v.style.cssText="position:fixed;left:-9999px;width:64px;height:64px";
    const done=r=>{clearTimeout(timer);v.remove();resolve(`${label}: ${r}`);};
    const timer=setTimeout(()=>done(`тайм-аут (rs${v.readyState} ns${v.networkState})`),6000);
    v.onerror=()=>done(`ошибка ${v.error?v.error.code:"?"}${v.error&&v.error.message?" "+v.error.message.slice(0,60):""}`);
    v.onplaying=()=>done("играет");
    document.body.appendChild(v); v.src=src; v.load(); v.play().catch(e=>done("play(): "+(e&&e.name)));
  });
  const results=[];
  results.push(await tryPlay("APK",`art/companion-probe/probe.webm`));
  try{const b=await (await fetch("art/companion-probe/probe.webm")).blob();results.push(await tryPlay("APK→память",URL.createObjectURL(b)));}catch(e){results.push("APK→память: fetch "+(e&&e.message));}
  const probes=store.probeSources?await store.probeSources("scene/day-1.webm"):{};
  for(const [label,src] of Object.entries(probes))results.push(await tryPlay(label,src));
  const ua=(navigator.userAgent.match(/Chrome\/[\d.]+/)||[""])[0];
  say(results.join(" · ")+` · ${ua}`);
}
function wireFoxPack(){
  const store=window.foxPackStore; if(!store)return;
  if($("#foxPackDownload"))$("#foxPackDownload").onclick=()=>{
    store.download(p=>{const pct=$("#foxPackPct"),bar=$("#foxPack .fox-pack-bar i");if(pct)pct.textContent=`${p}%`;if(bar)bar.style.width=`${p}%`;}).then(foxDrawerRerender).catch(foxPackRefresh);
    foxPackRefresh();
  };
  if($("#foxProbe"))$("#foxProbe").onclick=()=>foxProbeRun();
  if($("#foxPackRemove"))$("#foxPackRemove").onclick=()=>confirmSheet("Удалить анимации?","Лиса останется, но будет показываться неподвижной картинкой, пока набор не загрузить снова.","Удалить",()=>store.remove().then(foxDrawerRerender),true);
}
function companionCardHtml(){
  const j = journeyState(), p = LearningCore.petMood(S.companion,today());
  const male=foxMale(), who=foxWhoCap(), pronoun=foxPronoun();
  const moods = [male?"Рад тебя видеть":"Рада тебя видеть", male?"Загрустил":"Загрустила", "Скучает по тебе", male?"Обиделся":"Обиделась"];
  // Ночью (23:30–07:30) лиса спит: заголовок и подсказка про сон вместо приветствия.
  const asleepNow=foxPeriod()==="night"&&foxHasClip(foxCurrent(),"sleep");
  if(asleepNow)moods[p.mood]=p.mood>=1?"Спит, отвернувшись":"Сладко спит";
  const sleepText=`Ночью ${who} спит и видит сны про новые слова. Коснись — ${pronoun} шевельнётся, а утром проснётся ${male?"сам":"сама"}.`;
  const texts = [asleepNow ? sleepText : p.last === today() ? `Сегодня мы уже позанимались. ${who} рад${male?"":"а"}, что ты заглянул!` : p.last ? "У нас есть несколько слов для короткого занятия." : `${who} теперь твой компаньон. Давай начнём с пяти слов?`, `Один день без занятия. ${who} ждёт вашей следующей встречи.`, `Два дня без занятия. ${who} совсем ${male?"приуныл":"приуныла"}.`, `Три дня или больше без занятия. ${who} ${male?"отвернулся":"отвернулась"} и не смотрит — начните урок вместе.`];
  const total = Object.keys(j.completed).length, next = FOX_REWARDS.find(r=>!j.rewards[r.id]);
  const week = Array.from({length:7},(_,i)=>addDays(today(),i-6));
  const weekly = week.filter(d=>j.completed[d]).length;
  return `<section class="card companion" id="companionCard">
    <div class="row between fox-card-head"><div class="eyebrow">${male?"Твой":"Твоя"} ${esc(foxWho())}</div><div class="fox-card-tools"><button class="btn ghost small" id="foxIdentity">Имя и образ</button><button class="btn ghost small" id="foxCollection">Отметки · ${Object.keys(j.rewards).length}/${FOX_REWARDS.length}</button></div></div>
    <div class="fox-meeting">${foxStageHtml(foxCurrent(),p.mood,`${who}: ${moods[p.mood]}`)}<div><h2>${moods[p.mood]}</h2><p class="small muted">${esc(asleepNow?sleepText:texts[p.mood])}</p></div></div>
    ${foxPackCardHtml()}
    <div class="fox-beta"><b>Бета-версия компаньона</b><span>Лиса живёт по часам телефона: утро, день, вечер и ночной сон, а настроение зависит от занятий. Предметы, домики и новые взаимодействия появятся в следующих версиях.</span></div>
    <p class="small fox-response" id="foxResponse" role="status" aria-live="polite">${memoryCount() ? `Сегодня ты вспомнил ${plural(memoryCount(),"слово","слова","слов")} после перерыва.` : p.mood>=3 ? `${who} обидел${male?"ся":"ась"} и сидит спиной. Только занятие вернёт ${male?"его":"её"}.` : p.mood>=1 ? `${who} грустит без занятий. Коснись — ${pronoun} вздохнёт.` : `Коснись ${foxWho("gen")} — ${pronoun} откликнется.`}</p>
    <div class="fox-week" aria-label="Занятия за последние семь дней">${week.map(d=>`<span class="${j.completed[d]?"done":""}" title="${d}">${j.completed[d]?"✓":"·"}</span>`).join("")}<b>${weekly}/4 дня</b></div>
    <p class="small muted">${weekly>=4?"Недельная цель выполнена. Можно отдохнуть или продолжить в своём темпе.":"Цель — четыре дня занятий за последние семь. Не обязательно подряд."}</p>
    ${window.pinCompanion?'<button class="btn ghost small" id="foxPin">Добавить лису на рабочий стол</button>':""}

  </section>`;
}
function foxFaceIcon(){return `<img src="${FOX_V2_DIR}/handle.png" alt="" draggable="false">`;}
const foxSexBadge = sex => sex==="male" ? `<span class="fox-sex male" title="Лис">♂ Лис</span>` : `<span class="fox-sex female" title="Лиса">♀ Лиса</span>`;
// Выбор спутника: доступные лисы показывают петлю покоя, остальные — приглушённую карточку. Имя задаётся один раз.
function companionChooserHtml(){
  const identity=foxIdentity(), adopted=!!S.companion.adopted&&!!identity.name, selected=foxCurrent()?.id||"";
  return `<section class="card companion fox-choose" id="companionChooser">
    <div class="eyebrow">Компаньон · бета</div><h2>${adopted?"Другая лиса":"Выбери спутника"}</h2>
    <p class="small muted">Бета-версия компаньона: лиса живёт по часам телефона — утро, день, вечер и ночной сон. Позже будут открываться новые взаимодействия, предметы и домики.</p>
    <div class="fox-grid" role="radiogroup" aria-label="Лисы">${LearningCore.petFoxes.map(fox=>`<button type="button" class="fox-option ${fox.id===selected?"on":""} ${fox.available?"":"locked"}" data-fox="${fox.id}" role="radio" aria-checked="${fox.id===selected}" ${fox.available?"":"disabled"}>
      <span class="fox-option-art">${fox.available&&!foxStill()&&foxPreviewClip(fox)?`<video src="${foxAsset(fox,foxPreviewClip(fox))}" poster="${foxPoster(fox)}" autoplay muted loop playsinline disablepictureinpicture></video>`:`<img src="${foxPoster(fox)}" alt="">`}</span>
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
  host.innerHTML=`<div class="fox-drawer-scrim"><aside class="fox-drawer" role="dialog" aria-modal="true" aria-labelledby="foxDrawerTitle"><div class="fox-drawer-head"><div><div class="eyebrow">Компаньон</div><h2 id="foxDrawerTitle">${choose&&!foxReady()?"Новый спутник":`Домик ${esc(foxWho("gen"))}`}</h2></div><button class="icon-btn" id="foxDrawerClose" aria-label="Закрыть">${ICONS.close}</button></div>${journeyHeroHtml("foxJourney")}${choose?companionChooserHtml():companionCardHtml()}</aside></div>`;
  document.body.classList.add("fox-drawer-open");
  $("#foxDrawerClose").onclick=closeCompanion;
  $(".fox-drawer-scrim").onclick=e=>{if(e.target===e.currentTarget)closeCompanion();};
  if($("#foxJourney"))$("#foxJourney").onclick=journeyStart;
  if(choose){wireCompanionChooser();$("#foxDrawerClose").focus();return;}
  wireCompanion(); wireFoxPack();
  foxPlayerStart();
  if(options.celebrate)playFoxAnimation("happy");
  $("#foxDrawerClose").focus();
}
function closeCompanion(){
  foxPlayerReset();
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
  return `<details class="card progress-accordion"><summary><span><span class="eyebrow">Инфографика</span><b>Пройденный материал</b></span><strong class="num">${learned} / ${WORDS.length}</strong></summary><div class="progress-body">
    <div class="progress-overview"><div class="progress-donut" style="--done:${learned/WORDS.length*360}deg"><span><b>${Math.round(learned/WORDS.length*100)}%</b><small>изучено</small></span></div><div class="progress-legend"><span><i class="s1"></i>Учу <b>${statuses[1]}</b></span><span><i class="s2"></i>Знаю <b>${statuses[2]}</b></span><span><i class="s3"></i>Закреплено <b>${statuses[3]}</b></span><span><i></i>Впереди <b>${statuses[0]}</b></span></div></div>
    <div><div class="row between"><b>Активность за 14 дней</b><span class="small muted">слова</span></div><div class="progress-bars">${recent.map((x,i)=>`<i class="${x.value?"on":""} ${i===13?"today":""}" style="height:${Math.max(5,Math.round(x.value/max*100))}%" title="${x.day}: ${x.value}"></i>`).join("")}</div></div>
    <div><b>Повторения на неделю</b><div class="due-week">${next7.map((x,i)=>`<span class="${x.count?"has":""}"><small>${i?new Date(x.day+"T12:00:00").toLocaleDateString("ru-RU",{weekday:"short"}):"сегодня"}</small><b>${x.count}</b></span>`).join("")}</div></div>
    ${modeRows?`<div><b>Точность по режимам</b><div class="progress-modes">${modeRows}</div></div>`:""}
  </div></details>`;
}
function companionCollection(){
  const j = journeyState();
  const male=foxMale(), who=foxWhoCap();
  sheet(`<div class="row between"><h2>Отметки ${esc(foxWho("gen"))}</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div><p class="muted">Памятные отметки за дни занятий. Пропуски их не отнимают. Предметы для домика за достижения появятся позже.</p><div class="fox-rewards">${FOX_REWARDS.map(r=>`<div class="card ${j.rewards[r.id]?"earned":""}"><span class="reward-icon">${r.icon}</span><b>${r.name}</b><p class="small muted">${r.desc}</p><span class="small">${j.rewards[r.id]?`Получено ${j.rewards[r.id]}`:"Ещё впереди"}</span></div>`).join("")}</div><p class="small muted">После первого пропущенного дня ${esc(who)} грустит, после третьего обижается и садится спиной. Одно завершённое занятие возвращает ${male?"его":"её"} к общению.</p>`);
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
function wireCompanion(){
  if($("#foxCollection"))$("#foxCollection").onclick=companionCollection;
  if($("#foxIdentity"))$("#foxIdentity").onclick=()=>companionIdentitySheet();
  if($("#foxPin"))$("#foxPin").onclick=()=>window.pinCompanion().catch(()=>toast("Добавь виджет через меню рабочего стола"));
}
let journeyRunning = false;
function journeyPlan(){
  const j = journeyState();
  if(!j.plan || j.plan.day !== today()) {
    const block = learnBlock !== null && blockUnstarted(learnBlock).length ? learnBlock : firstBlockToLearn();
    const due = dueList(), load = LearningCore.dailyLoad(due.length, recentAccuracy());
    j.plan = {day:today(),review:due.sort((a,b)=>W(a).due.localeCompare(W(b).due)).slice(0,load.review).map(wk),fresh:blockUnstarted(block).slice(0,load.fresh).map(wk),reviewed:{},checked:{},errors:{},repaired:{},done:false};
    if(load.reason) j.plan.reason = load.reason;
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
// Точность ответов за последние три дня (null — ответов не было).
function recentAccuracy(){
  let ok=0,q=0; for(let k=0;k<3;k++){ const r=S.days[addDays(today(),-k)]; if(r){ ok+=r.ok||0; q+=r.q||0; } }
  return q>=10 ? ok/q : null;
}
function journeyNext(){
  journeyRunning=true;
  const p=journeyPlan(), ids=words=>words.map(w=>KEY_INDEX[w]).filter(i=>i!==undefined);
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
  const response=$("#foxResponse");if(response)response.textContent=`Занятие закончено: ${p.review.length} слов в практике, ${p.fresh.length} новых. ${first?"Сегодняшняя встреча отмечена.":"Сегодняшняя встреча уже была отмечена."}`;
}
function tomorrowText(){
  const n=startedList().filter(i=>W(i).due===addDays(today(),1)).length;
  return n?`Завтра вас ждут ${plural(n,"слово","слова","слов")} на повторение.`:"Следующее занятие подберём, когда ты вернёшься.";
}
function journeyHeroHtml(id="hJourney"){
  const p=journeyPlan(), done=p.done, started=Object.keys(p.reviewed).length+Object.keys(p.checked).length>0;
  const review=p.review.filter(w=>!p.reviewed[w]).length, fresh=p.fresh.filter(w=>!p.checked[w]).length, repair=Object.keys(p.errors).filter(w=>!p.repaired[w]).length;
  const minutes=LearningCore.lessonMinutes(review,fresh,repair);
  const parts=[review?`повторить ${review}`:null, fresh?`новых ${fresh}`:null, repair?`разбор ошибок ${repair}`:null].filter(Boolean).join(" → ");
  return `<button class="btn block huge" id="${id}" ${done?"disabled":""}>${done?"Занятие на сегодня завершено":started?"Продолжить занятие":"Занятие на сегодня"}${done?"":` <span class="lesson-time">· ~${minutes} мин</span>`}</button><p class="small muted" style="text-align:center">${done?tomorrowText():parts||"Короткая практика по начатым словам"}${!done&&p.reason?`<br>${esc(p.reason)}`:""}</p>`;
}
// Понятные показатели дня: сколько повторить, сколько вспомнил сам, что регулярно забывается.
function loadCardHtml(){
  const due=dueList().length, recalled=memoryCount(), week=Array.from({length:7},(_,k)=>S.days[addDays(today(),-k)]).reduce((n,r)=>n+Object.keys(r?.remembered||{}).length,0);
  const forgotten=LearningCore.forgottenKeys(S.w).map(k=>KEY_INDEX[k]).filter(i=>i!==undefined);
  return `<section class="card"><div class="theme-stat-grid"><div class="theme-stat"><b>${due}</b><span>к повторению</span></div><div class="theme-stat"><b>${recalled}</b><span>вспомнил сам сегодня</span></div><div class="theme-stat"><b>${week}</b><span>за неделю</span></div></div>${forgotten.length?`<div class="eyebrow" style="margin-top:12px">Регулярно забываются</div><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${forgotten.map(i=>`<button class="chip warn" data-forgot="${i}">${esc(WORDS[i][0])} · ${W(i).bad}</button>`).join("")}</div>`:""}</section>`;
}
