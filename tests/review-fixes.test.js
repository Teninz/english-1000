const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../learning-core');
const levels=require('../word-levels');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const add=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10);

function app(){
  const timers=new Map(),intervals=new Map(),nodes=new Map();let serial=0;
  const element=()=>({innerHTML:'',textContent:'',value:'',disabled:false,isConnected:true,dataset:{},classList:{add(){},remove(){}},focus(){},querySelectorAll:()=>[]});
  const node=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
  const ctx={console,Date,URLSearchParams,performance:{now:()=>10000},navigator:{},
    setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),
    setInterval:(fn,ms)=>{const id=++serial;intervals.set(id,{fn,ms});return id;},clearInterval:id=>intervals.delete(id),
    document:{visibilityState:'visible',querySelector:node,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},removeEventListener(){}},
    localStorage:{getItem:()=>null,setItem(){}},TTS:{stop(){}},checkAch(){},dailyEvent(){}};
  ctx.window=ctx;ctx.scrollTo=()=>{};
  vm.createContext(ctx);
  for(const f of ['learning-core.js','word-forms.js','progress-storage.js','journey.js','words-a.js','words-b.js','ex-ru.js','word-levels.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js','thematic-data.js','thematic.js'])vm.runInContext(read(f),ctx,{filename:f});
  const inline=read('index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(inline.slice(0,inline.indexOf('/* ---------- старт')),ctx);
  const run=code=>vm.runInContext(code,ctx);
  run('S=LearningCore.empty(); save=()=>true; checkAch=()=>{}; dailyEvent=()=>{}; buzz=()=>{}; speak=()=>{};');
  const flush=ms=>{for(const [id,t] of [...timers])if(t.ms===ms){timers.delete(id);t.fn();}};
  return {ctx,run,node,element,timers,intervals,flush};
}

test('обратный выбор не предлагает второй правильный синоним, варианты остаются уникальны',()=>{
  const {run}=app();
  // пары с общим переводом внутри одной части речи есть и в A1 (flat/apartment), и в дополнительном словаре (evident/seldom)
  const words=JSON.parse(run('JSON.stringify(WORDS.filter((w,i)=>WORDS.some((x,j)=>j!==i&&LearningCore.sharesTranslation(w,x))).map(w=>w[0]).slice(0,12))'));
  assert.ok(words.length>=6,'есть слова с синонимами');
  for(const word of words){
    assert.equal(run(`(()=>{const i=WORDS.findIndex(w=>w[0]===${JSON.stringify(word)});for(let n=0;n<30;n++){const ds=distractors(i,3,0,true);if(ds.length!==3||new Set(ds.map(j=>WORDS[j][0])).size!==3||ds.some(j=>LearningCore.sharesTranslation(WORDS[i],WORDS[j])))return false;}return true;})()`),true,word);
  }
});

test('письменный синоним засчитывается без штрафа и без повышения интервала исходного слова',()=>{
  const {run,node,element,ctx}=app();
  ctx.box=element();ctx.captured=[];
  run('record=(...args)=>captured.push(args);feedback=(...args)=>{window.note=args[4]};const target=WORDS.findIndex(w=>w[0]==="apartment");qType(box,{i:target});');
  node('#ti').value='flat';node('#chk').onclick();
  assert.equal(ctx.captured[0][1],true);assert.equal(ctx.captured[0][3],true);
  assert.match(ctx.box.innerHTML,/возможны синонимы/);
  const record=core.schedule({box:2,due:'2026-09-20',ok:2,bad:0},true,'2026-09-20',add,ctx.captured[0][3]);
  assert.equal(record.box,2);assert.equal(record.bad,0);assert.equal(record.due,'2026-09-20');
});

test('точное написание повышает интервал, неправильное слово остаётся ошибкой',()=>{
  for(const [answer,ok,assisted] of [['apartment',true,false],['elephant',false,false],['apartmen',true,true]]){
    const {run,node,element,ctx}=app();ctx.box=element();ctx.captured=[];
    run('record=(...args)=>captured.push(args);feedback=()=>{};qType(box,{i:WORDS.findIndex(w=>w[0]==="apartment")});');
    node('#ti').value=answer;node('#chk').onclick();
    assert.equal(ctx.captured[0][1],ok,answer);assert.equal(ctx.captured[0][3],assisted,answer);
  }
});

test('значения разделяются без потери уточнений и без смешивания частей речи',()=>{
  assert.deepEqual(core.translationTerms('оценивать (качество, важность); определять'),['оценивать качество важность','определять']);
  assert.equal(core.sharesTranslation(['bank','банк (финансы)','n'],['shore','берег (реки)','n']),false);
  assert.equal(core.sharesTranslation(['x','отдых','n'],['y','отдых','v']),false);
  assert.equal(core.sharesTranslation(['x','предполагать, допускать','v'],['y','допускать; разрешать','v']),true);
  assert.equal(core.englishMatch('obvious','evident'),false,'произношение проверяет именно показанное слово');
});

test('одинаковые подписи в парах взаимозаменяемы',()=>{
  const {run,ctx,element}=app();ctx.box=element();ctx.captured=[];
  const left=[element(),element()],right=[element(),element()];
  ctx.box.querySelectorAll=s=>s==='#L .opt'?left:right;
  ctx.left=left;ctx.right=right;
  run('const pair=[WORDS.findIndex(w=>w[0]==="flat"),WORDS.findIndex(w=>w[0]==="apartment")];left.forEach((x,n)=>x.dataset.i=pair[n]);right.forEach((x,n)=>x.dataset.i=pair[n]);record=(...a)=>captured.push(a);qPairs(box,{group:pair});');
  left[0].onclick();right[1].onclick();
  assert.equal(ctx.captured.length,1);assert.equal(ctx.captured[0][1],true);
});

function nativeRoadFixture(){
  const fixture=app(),{ctx,run}=fixture;ctx.events=[];
  const wrapper=read('native.js').match(/window\.hfStop = function \(\) \{[^\n]+/)[0];
  run(`const origHfStop=hfStop;const NATIVE={awake:{allowSleep:()=>{events.push('sleep');return Promise.resolve();}}};const Road={stop:()=>{events.push('road-stop');return Promise.resolve();}};${wrapper}`);
  run('hf.on=true;hf.queue=[0,1];hf.res=[{i:0,ok:true},{i:1,ok:false}];hf.lock={release:()=>events.push("browser-release")};speakAsync=async()=>{};go=t=>events.push("go:"+t);showResults=()=>events.push("results");toast=()=>{};');
  return fixture;
}

test('естественное завершение всех голосовых режимов останавливает сервис и удержание экрана',async()=>{
  for(const mode of ['listen','ru','en']){
    const {ctx,run}=nativeRoadFixture();run(`hfMode=${JSON.stringify(mode)}`);await run('hfFinish()');
    assert.equal(run('hf.on'),false);assert.equal(run('hf.lock'),null);
    for(const event of ['sleep','road-stop','browser-release'])assert.equal(ctx.events.filter(x=>x===event).length,1,mode+': '+event);
    assert.ok(ctx.events.includes(mode==='listen'?'go:road':'results'));
  }
});

test('ошибка финальной озвучки не оставляет сервис и не прячет результаты',async()=>{
  const {ctx,run}=nativeRoadFixture();run('hfMode="ru";speakAsync=async()=>{throw Error("TTS unavailable")};');
  await run('hfFinish()');assert.ok(ctx.events.includes('road-stop'));assert.ok(ctx.events.includes('results'));
});

test('завершившаяся озвучка не возвращает экран после ухода пользователя',async()=>{
  const {ctx,run}=nativeRoadFixture();let finishSpeech;ctx.waitSpeech=new Promise(resolve=>finishSpeech=resolve);
  run('hfMode="ru";speakAsync=()=>waitSpeech');const finish=run('hfFinish()');run('endSession()');finishSpeech();await finish;
  assert.equal(ctx.events.includes('results'),false);
});

function answeredLesson(){
  const f=app(),{ctx,run,element}=f;const button=element();
  button.dataset.answer=run('thematicWords("forest")[0][1]');
  ctx.document.querySelectorAll=s=>s==='[data-answer]'?[button]:[];
  run('for(const i of [0,1])LearningCore.thematicIntroduce(thematicTopic("forest"),thematicWords("forest")[i][0],today());thematicStartQuiz("forest",[0,1],"Проверка порции")');button.onclick();
  return f;
}

test('быстрый выход из тематической проверки не возвращает старый экран',()=>{
  const {run,node,flush}=answeredLesson();run('endSession()');node('#view').innerHTML='другая тренировка';flush(480);
  assert.equal(node('#view').innerHTML,'другая тренировка');assert.equal(run('thematicSession'),null);
});

test('выход крестиком отменяет отложенный переход без ошибки null',()=>{
  const {run,node,flush}=answeredLesson();
  run('confirmSheet=(a,b,c,yes)=>yes();renderThematicTopic=()=>{view().innerHTML="маршрут"};thematicLeaveLesson("forest")');
  assert.doesNotThrow(()=>flush(480));assert.equal(node('#view').innerHTML,'маршрут');
});

test('сворачивание не отменяет переход в незакрытом тематическом занятии',()=>{
  const {ctx,run,flush}=answeredLesson();ctx.document.visibilityState='hidden';flush(480);
  assert.equal(run('thematicSession.k'),1);assert.equal(run('inSession'),true);
});

test('таймер блокировки не открывает покинутый экран, дедлайн остаётся в силе',()=>{
  const {ctx,run,element,intervals,flush}=app();const lock=element();let now=1000;
  ctx.Date={now:()=>now};lock.dataset.lock=31000;ctx.document.querySelectorAll=s=>s==='[data-lock]'?[lock]:[];ctx.finished=0;
  run('thematicWireCooldowns(()=>finished++)');const tick=[...intervals.values()][0].fn;
  lock.isConnected=false;now=31000;tick();flush(0);
  assert.equal(ctx.finished,0);assert.equal(Number(lock.dataset.lock),31000);assert.equal(intervals.size,0);
});

test('свёрнутое приложение продолжает отсчёт блокировки на том же экране',()=>{
  const {ctx,run,element,intervals,flush}=app();const lock=element();let now=1000;
  ctx.Date={now:()=>now};lock.dataset.lock=31000;ctx.document.visibilityState='hidden';ctx.document.querySelectorAll=s=>s==='[data-lock]'?[lock]:[];ctx.finished=0;
  run('thematicWireCooldowns(()=>finished++)');const tick=[...intervals.values()][0].fn;
  now=16000;tick();assert.equal(lock.textContent,'00:15');now=31000;tick();flush(0);assert.equal(ctx.finished,1);
});

test('уход между истечением блокировки и перерисовкой также безопасен',()=>{
  const {ctx,run,element,flush}=app();const lock=element();ctx.Date={now:()=>1000};lock.dataset.lock=500;
  ctx.document.querySelectorAll=s=>s==='[data-lock]'?[lock]:[];ctx.finished=0;run('thematicWireCooldowns(()=>finished++)');
  lock.isConnected=false;flush(0);assert.equal(ctx.finished,0);
});

test('восстановленный блиц считает время закрытого приложения',()=>{
  const s=core.empty(),topic=core.thematicTopic(s,'forest'),words=Array.from({length:100},(_,i)=>'w'+i),start=1800000000000;
  for(const word of words)core.thematicIntroduce(topic,word,'2026-09-20');
  core.thematicExamStart(topic,words,start,10000);
  const restored=core.validate(JSON.parse(JSON.stringify(s))).thematic.topics.forest;
  const result=core.thematicExamTick(restored,start+30000,40000);
  assert.equal(result.status,'failed');assert.equal(result.errors,5);assert.equal(restored.exam.active,null);
  assert.ok(core.thematicExamCooldown(restored,start+30000)>0);
});

test('перевод часов назад не даёт продолжить блиц',()=>{
  const s=core.empty(),topic=core.thematicTopic(s,'forest'),words=Array.from({length:100},(_,i)=>'w'+i),start=1800000000000;
  for(const word of words)core.thematicIntroduce(topic,word,'2026-09-20');
  core.thematicExamStart(topic,words,start,10000);
  const result=core.thematicExamTick(topic,start-86400000,40000);
  assert.equal(result.status,'failed');assert.equal(topic.exam.active,null);
  assert.ok(core.thematicExamCooldown(topic,start-86400000)>0);
});

test('CEFR одинаков для слова и части речи в разных маршрутах, неизвестные слова не получают метку',()=>{
  const {run}=app();
  assert.equal(levels.lookup('atmosphere','n').level,'B1');assert.equal(levels.lookup('bridge','n').level,'A2');
  assert.equal(levels.lookup('gravity','n').level,'C1');assert.equal(levels.lookup('settings','n'),null);
  assert.equal(run('thematicLevelHtml(["settings","настройки","n"])'),'');
  assert.equal(run('(()=>{const seen=new Map();for(const words of Object.values(THEMATIC_WORDS))for(const w of words){const key=w[0]+"|"+w[2];if(seen.has(key)&&seen.get(key)!==w[5])return false;seen.set(key,w[5]);}return true;})()'),true);
  for(const [key,entry] of Object.entries(levels.entries)){
    assert.match(entry.level,/^[ABC][12]$/,key);assert.ok(levels.sources[entry.source],key);assert.ok(entry.page>0,key);assert.ok(entry.entry.includes(entry.level),key);
  }
});

test('словарная разметка включена в HTML, офлайн-кэш и сборку APK',()=>{
  const html=read('index.html');assert.ok(html.indexOf('src="word-levels.js"')<html.indexOf('src="thematic-data.js"'));
  assert.ok(read('sw.js').includes('"./word-levels.js"'));assert.ok(read('tools/build-web.js').includes('"word-levels.js"'));
});

test('слова, выбывшие из маршрута, вычищаются из прогресса вместе с незавершённым блицем',()=>{
  const {run}=app();
  run('S.thematic.topics.space=LearningCore.thematicTopicEmpty();const t=S.thematic.topics.space;t.words.browser={box:2,due:today(),ok:1,bad:0};t.introduced.browser=1;t.words.planet={box:2,due:today(),ok:1,bad:0};t.introduced.planet=1;t.exam.active={attemptId:"x",order:["browser"],index:0,errors:0,correct:0,startedWall:1,questionWall:1,questionMono:1};');
  const topic=run('JSON.stringify(thematicTopic("space"))');
  const parsed=JSON.parse(topic);
  assert.deepEqual(Object.keys(parsed.words),['planet']);assert.deepEqual(Object.keys(parsed.introduced),['planet']);assert.equal(parsed.exam.active,null);
  assert.equal(run('thematicIntroduced("space")'),1);
});

test('стартовая проверка: ничего не оценивает, при 12 верных отмечает нижние уровни известными с разнесёнными датами',()=>{
  const {run,ctx}=app();
  assert.deepEqual(JSON.parse(run('JSON.stringify(LearningCore.knownEntry("2026-09-21",addDays))')),{box:5,due:'2026-10-05',ok:0,bad:0,known:1});
  run('startPlacement(2)');
  assert.equal(run('sess.mode'),'placement');assert.equal(run('sess.items.length'),15);
  assert.equal(run('sess.items.every(it=>levelOf(it.i)===2)'),true,'слова только уровня B1');
  run('record(sess.items[0].i,false,"mc")');
  assert.equal(run('Object.keys(S.w).length'),0,'ответ не попадает в прогресс');assert.equal(run('sess.items.length'),15,'без повтора ошибки');
  run('for(let k=1;k<15;k++)record(sess.items[k].i,k<13,"mc")');
  run('toast=()=>{};go=()=>{};sess.k=15;showResults()');
  assert.equal(run('sess.placementLevel'),2);assert.equal(run('inSession'),false);
  assert.match(run('document.querySelector("#view").innerHTML'),/уровень B1 подтверждён/);
  run('placementApply(2,80,sess.res.filter(x=>x.ok).map(x=>x.i))');
  const below=run('PROGRAM_LEVELS[0].blocks.concat(PROGRAM_LEVELS[1].blocks).reduce((n,b)=>n+b.ids.length,0)');
  assert.equal(run('Object.keys(S.w).length'),below+12);
  assert.equal(run('Object.values(S.w).every(r=>r.box===6&&r.known===1&&r.due>=addDays(today(),30)&&r.due<=addDays(today(),120))'),true);
  assert.equal(run('S.placement.level'),'B1');assert.equal(run('levelOf(BLOCKS[learnBlock].ids[0])'),2);
  assert.equal(run('LearningCore.assumeKnown(S,[wk(0)],today(),addDays)'),0,'начатое слово не перезаписывается');
  assert.doesNotThrow(()=>run('LearningCore.validate(JSON.parse(JSON.stringify(S)))'));
  const confirmed=core.schedule({box:6,due:'2026-09-21',ok:0,bad:0,known:1},true,'2026-09-21',add);
  assert.equal(confirmed.known,undefined,'самостоятельный ответ снимает пометку');
  assert.equal(core.schedule({box:6,due:'2026-09-21',ok:0,bad:0,known:1},true,'2026-09-21',add,true).known,1,'ответ с подсказкой — нет');
  assert.ok(JSON.parse(run('JSON.stringify(LearningCore.portable(S))')).placement);
});

