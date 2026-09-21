// Ежедневное занятие и нейтральная система мотивации «Путь Oxford 3000».
const MOTIVATION_MILESTONES = [10,50,100,300,500,1000,2000,3000];

function journeyState(){
  S.journey=S.journey&&typeof S.journey==="object"?S.journey:{completed:{},rewards:{}};
  S.journey.completed=S.journey.completed||{};
  S.journey.rewards=S.journey.rewards||{}; // совместимость со старыми копиями
  return S.journey;
}
function lessonComplete(){
  const j=journeyState(),day=today(),first=!j.completed[day];
  j.completed[day]=1;save();return first;
}
function maybeCompleteLesson(results){
  if(new Set(results.filter(r=>!r.retry).map(r=>r.i)).size>=5)lessonComplete();
}
function activeStreak(){return S.streak.last&&S.streak.last>=addDays(today(),-1)?S.streak.n:0;}
function activityCount(){return Object.keys(dayRec().words||{}).length;}
function memoryCount(){return Object.keys(dayRec().remembered||{}).length;}

const motivationFixedCount=()=>startedList().filter(i=>!W(i)?.known&&status(i)===3).length;
const motivationLevelRows=()=>PROGRAM_LEVELS.filter(level=>["A1","A2","B1","B2"].includes(level.id)).map(level=>{
  const ids=level.blocks.flatMap(block=>block.ids),done=ids.filter(i=>status(i)>=2).length;
  return {id:level.id,done,total:ids.length,pct:ids.length?Math.round(done/ids.length*100):0};
});
function motivationCardHtml(){
  const fixed=motivationFixedCount(),shown=Math.min(3000,fixed),next=MOTIVATION_MILESTONES.find(value=>value>fixed)||3000;
  const previous=[0,...MOTIVATION_MILESTONES].filter(value=>value<=fixed).at(-1)||0;
  const span=Math.max(1,next-previous),step=Math.min(100,Math.round((fixed-previous)/span*100));
  const week=Array.from({length:7},(_,index)=>addDays(today(),index-6)),active=week.filter(day=>journeyState().completed[day]).length;
  const levels=motivationLevelRows();
  const message=fixed>=3000?"Oxford 3000 закреплён. Продолжай повторения, чтобы знания оставались активными.":`До следующей вехи — ${plural(next-fixed,"слово","слова","слов")}.`;
  return `<section class="card motivation-card" id="motivationCard">
    <div class="row between motivation-head"><div><div class="eyebrow">Путь Oxford 3000</div><h2>Знания, которые остаются</h2></div><strong>${shown} / 3000</strong></div>
    <div class="motivation-meter" aria-label="${step}% до следующей вехи"><i style="width:${step}%"></i></div>
    <div class="row between motivation-next"><span>${message}</span><b>${fixed>=3000?"готово":next}</b></div>
    <div class="motivation-levels">${levels.map(level=>`<div><span>${level.id}</span><i><b style="width:${level.pct}%"></b></i><strong>${level.pct}%</strong></div>`).join("")}</div>
    <div class="motivation-week"><span><b>${active}/4</b><small>учебных дня за неделю</small></span><div>${week.map(day=>`<i class="${journeyState().completed[day]?"on":""}" title="${day}"></i>`).join("")}</div></div>
  </section>`;
}

function progressAccordionHtml(){
  const started=startedList(),statuses=[0,1,2,3].map(s=>allIdx().filter(i=>status(i)===s).length);
  const learned=statuses[2]+statuses[3],recent=Array.from({length:14},(_,k)=>{const day=addDays(today(),k-13),r=S.days[day],value=r?(r.n||0)+(r.q||0):0;return {day,value};});
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

let journeyRunning=false;
function journeyPlan(){
  const j=journeyState();
  if(!j.plan||j.plan.day!==today()){
    const block=learnBlock!==null&&blockUnstarted(learnBlock).length?learnBlock:firstBlockToLearn();
    const due=dueList(),load=LearningCore.dailyLoad(due.length,recentAccuracy());
    j.plan={day:today(),review:due.sort((a,b)=>W(a).due.localeCompare(W(b).due)).slice(0,load.review).map(wk),fresh:blockUnstarted(block).slice(0,load.fresh).map(wk),reviewed:{},checked:{},errors:{},repaired:{},done:false};
    if(load.reason)j.plan.reason=load.reason;
    if(!j.plan.review.length&&!j.plan.fresh.length)j.plan.review=sample(startedList(),5).map(wk);
    save();
  }
  return j.plan;
}
function journeyRecord(i,ok){
  if(!journeyRunning)return;
  const p=journeyPlan(),word=wk(i);
  if(p.phase==="review")p.reviewed[word]=1;
  if(p.phase==="check")p.checked[word]=1;
  if(p.phase==="repair")p.repaired[word]=1;
  if(!ok)p.errors[word]=1;
  save();
}
function journeyStart(){
  endSession();journeyRunning=true;tab="home";renderTabs();
  const p=journeyPlan();
  if(p.firstOfDay===undefined){p.firstOfDay=!journeyState().completed[today()];save();}
  if(p.done){journeyRunning=false;go("home");toast("Занятие на сегодня завершено. Другие тренировки доступны во вкладках.");return;}
  journeyNext();
}
function recentAccuracy(){
  let ok=0,q=0;for(let k=0;k<3;k++){const r=S.days[addDays(today(),-k)];if(r){ok+=r.ok||0;q+=r.q||0;}}
  return q>=10?ok/q:null;
}
function journeyNext(){
  journeyRunning=true;
  const p=journeyPlan(),ids=words=>words.map(word=>KEY_INDEX[word]).filter(i=>i!==undefined);
  const review=ids(p.review.filter(word=>!p.reviewed[word]));
  if(review.length){p.phase="review";save();startSession({title:"Сегодня · вспоминаем",items:review.map(i=>({i,kind:kindForBox(W(i)?.box||0,i)})),mode:"review",after:"home",onComplete:journeyNext});return;}
  const fresh=ids(p.fresh).filter(i=>!W(i));
  if(fresh.length){p.phase="new";save();startLearnBatch(fresh,()=>journeyNext());return;}
  const check=ids(p.fresh.filter(word=>!p.checked[word])).filter(i=>W(i)?.box<6);
  if(check.length){p.phase="check";save();startSession({title:"Сегодня · новые слова",items:check.map(i=>({i,kind:"mc"})),mode:"learn",after:"home",onComplete:journeyNext});return;}
  const repair=ids(Object.keys(p.errors).filter(word=>!p.repaired[word]));
  if(repair.length){p.phase="repair";save();startSession({title:"Сегодня · ещё одна встреча",items:repair.map(i=>({i,kind:"mc"})),mode:"repair",after:"home",onComplete:journeyNext});return;}
  p.done=true;journeyRunning=false;inSession=false;lessonComplete();go("home");
  toast(`Занятие завершено: ${p.review.length} в практике, ${p.fresh.length} новых.`);
}
function tomorrowText(){
  const n=startedList().filter(i=>W(i).due===addDays(today(),1)).length;
  return n?`Завтра вас ждут ${plural(n,"слово","слова","слов")} на повторение.`:"Следующее занятие подберём, когда ты вернёшься.";
}
function journeyHeroHtml(id="hJourney"){
  const p=journeyPlan(),done=p.done,started=Object.keys(p.reviewed).length+Object.keys(p.checked).length>0;
  const review=p.review.filter(word=>!p.reviewed[word]).length,fresh=p.fresh.filter(word=>!p.checked[word]).length,repair=Object.keys(p.errors).filter(word=>!p.repaired[word]).length;
  const minutes=LearningCore.lessonMinutes(review,fresh,repair),parts=[review?`повторить ${review}`:null,fresh?`новых ${fresh}`:null,repair?`разбор ошибок ${repair}`:null].filter(Boolean).join(" → ");
  return `<button class="btn block huge" id="${id}" ${done?"disabled":""}>${done?"Занятие на сегодня завершено":started?"Продолжить занятие":"Занятие на сегодня"}${done?"":` <span class="lesson-time">· ~${minutes} мин</span>`}</button><p class="small muted" style="text-align:center">${done?tomorrowText():parts||"Короткая практика по начатым словам"}${!done&&p.reason?`<br>${esc(p.reason)}`:""}</p>`;
}
function loadCardHtml(){
  const due=dueList().length,recalled=memoryCount(),week=Array.from({length:7},(_,k)=>S.days[addDays(today(),-k)]).reduce((n,r)=>n+Object.keys(r?.remembered||{}).length,0);
  const forgotten=LearningCore.forgottenKeys(S.w).map(key=>KEY_INDEX[key]).filter(i=>i!==undefined);
  return `<section class="card"><div class="theme-stat-grid"><div class="theme-stat"><b>${due}</b><span>к повторению</span></div><div class="theme-stat"><b>${recalled}</b><span>вспомнил сам сегодня</span></div><div class="theme-stat"><b>${week}</b><span>за неделю</span></div></div>${forgotten.length?`<div class="eyebrow" style="margin-top:12px">Регулярно забываются</div><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${forgotten.map(i=>`<button class="chip warn" data-forgot="${i}">${esc(WORDS[i][0])} · ${W(i).bad}</button>`).join("")}</div>`:""}</section>`;
}
