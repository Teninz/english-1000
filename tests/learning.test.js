const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../learning-core');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const add=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10);
function app(){
  const store=new Map();
  const ctx={console,Date,URLSearchParams,setTimeout:()=>0,clearTimeout(){},window:{},navigator:{},TTS:{stop(){}},document:{querySelector:()=>({}),querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},checkAch(){},dailyEvent(){}};
  vm.createContext(ctx);
  for(const f of ['learning-core.js','score-core.js','word-forms.js','progress-storage.js','journey.js','words-a.js','words-b.js','ex-ru.js','word-levels.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js','thematic-data.js','competition-config.js','competition.js'])vm.runInContext(read(f),ctx,{filename:f});
  const script=read('index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script.slice(0,script.indexOf('/* ---------- старт')),ctx);
  vm.runInContext('S=LearningCore.empty();save=()=>true;checkAch=()=>{};dailyEvent=()=>{};buzz=()=>{};',ctx);
  return code=>vm.runInContext(code,ctx);
}
test('шесть ответов за день повышают только одну ячейку',()=>{
  let r;for(let i=0;i<6;i++)r=core.schedule(r,true,'2026-09-14',add);
  assert.equal(r.box,1);assert.equal(r.ok,6);assert.equal(r.due,'2026-09-15');
});
test('досрочная тренировка не отодвигает повторение',()=>{
  const r=core.schedule({box:4,due:'2026-10-01',ok:5,bad:0},true,'2026-09-14',add);
  assert.equal(r.box,4);assert.equal(r.due,'2026-10-01');
});
test('закреплённые слова снова повторяются через 60 дней',()=>{
  const run=app();assert.equal(run('S.w[wk(0)]={box:6,due:"2000-01-01",ok:6,bad:0};dueList().includes(0)'),true);
  const r=core.schedule({box:6,due:'2026-09-14',ok:6,bad:0},true,'2026-09-14',add);
  assert.equal(r.box,6);assert.equal(r.due,'2026-11-13');
});
test('ошибка снижает уровень один раз, переучивание возвращает завтра',()=>{
  let r={box:5,due:'2026-09-14',ok:5,bad:0};
  r=core.schedule(r,false,'2026-09-14',add);r=core.schedule(r,false,'2026-09-14',add);assert.equal(r.box,3);
  r=core.schedule(r,true,'2026-09-14',add);assert.equal(r.box,3);assert.equal(r.due,'2026-09-15');
  r=core.schedule(r,true,'2026-09-15',add);assert.equal(r.box,4);
});
test('подсказка не увеличивает интервал',()=>{
  const r=core.schedule(undefined,true,'2026-09-14',add,true);assert.equal(r.box,0);assert.equal(r.due,'2026-09-14');
});
test('разные английские слова не засчитываются как произношение',()=>{
  assert.equal(core.englishMatch('employer','employee'),false);
  assert.equal(core.englishMatch('I do not know employee','employee'),false);
  assert.equal(core.englishMatch('The word is employee.','employee'),true);
  assert.equal(core.englishMatch('analyze','analyse'),true);assert.equal(core.englishMatch('resume','résumé'),true);
  const run=app();assert.equal(run('matchAny(["employer"],["employee"])'),false);assert.equal(run('matchAny(["допускаю"],["допускать"],"ru")'),true);
});
test('программа: уникальные ключи слово|часть речи, у каждого слова пример с переводом, блоки по уровням',()=>{
  const run=app();
  assert.equal(run('WORDS.length'),run('WORD_KEYS.length'));assert.equal(run('new Set(WORD_KEYS).size'),run('WORDS.length'));
  assert.equal(run('WORDS.filter(w=>!w[4]).length'),0,'перевод примера есть у всех слов');
  assert.equal(run('JSON.stringify(WORDS.filter(w=>!wordRegex(w[0]).test(w[3])).map(w=>w[0]))'),'[]');
  assert.equal(run('Object.entries(WORD_CONTEXT).filter(([w,c])=>WORDS.some(x=>x[0]===w)&&(!c.ru||!wordRegex(w).test(c.example))).length'),0);
  assert.deepEqual(JSON.parse(run('JSON.stringify(PROGRAM_LEVELS.map(L=>L.id))')),['A1','A2','B1','B2','extra']);
  assert.equal(run('BLOCKS.every((b,n)=>b.ids.length>=10&&b.ids.length<=50&&b.ids.every(i=>WORD_BLOCK[i]===n))'),true);
  assert.equal(run('PROGRAM_LEVELS[0].blocks.reduce((n,b)=>n+b.ids.length,0)'),1076,'A1 — все 1076 единиц Oxford');
  assert.equal(run('new Set(BLOCKS.map(b=>b.id)).size'),run('BLOCKS.length'));
});
test('уровни Oxford 3000 проходят проверку по официальному списку, дополнительный словарь — вне списка',()=>{
  const {execFileSync}=require('node:child_process');
  const oxford=JSON.parse(read('tools/oxford-3000.json')),inOxford=new Set(oxford.units.map(u=>u[0]+'|'+u[1]));
  assert.equal(oxford.units.length,3810);
  for(const level of ['A1','A2','B1','B2']){
    const data=require('../oxford-'+level.toLowerCase());
    if(!data.blocks.length)continue;
    assert.doesNotThrow(()=>execFileSync(process.execPath,[path.join(root,'tools/program-check.js'),level],{stdio:'pipe'}),level);
  }
  const extra=require('../words-extra');
  const legacy=(()=>{const c={};vm.createContext(c);vm.runInContext(read('words-a.js')+read('words-b.js'),c);return vm.runInContext('[...WORDS_A,...WORDS_B]',c);})();
  const extraKeys=new Set(extra.blocks.flatMap(b=>b.words.map(w=>w[0]+'|'+w[2])));
  for(const k of extraKeys)assert.equal(inOxford.has(k),false,k+' есть в Oxford 3000 — не место в дополнительном словаре');
  for(const w of legacy)assert.ok(inOxford.has(w[0].toLowerCase()+'|'+w[2])||extraKeys.has(w[0]+'|'+w[2]),w[0]+' потеряно');
});
test('прогресс прежнего курса переносится на ключи слово|часть речи без потерь',()=>{
  const run=app();
  const old={v:2,goal:10,streak:{n:2,last:'2026-09-19'},days:{'2026-09-19':{n:1,q:2,ok:1,bad:1,words:{assume:1,deadline:1},remembered:{assume:1}}},
    w:{assume:{box:3,due:'2026-09-25',ok:4,bad:1},deadline:{box:1,due:'2026-09-20',ok:1,bad:0}},modes:{},hard:{deadline:1},
    journey:{completed:{},rewards:{},plan:{day:'2026-09-19',review:['assume'],fresh:['deadline'],reviewed:{assume:1},checked:{},errors:{},repaired:{},done:false}},
    daily:{d:'2026-09-19',tasks:[{id:'level',level:3,done:false,swapped:false},{id:'learn',target:5,done:false,swapped:false}],log:{learn:0,review:0,heard:0,pronOk:0,sessions:[]}}};
  const migrated=JSON.parse(JSON.stringify(run('LearningCore.validate('+JSON.stringify(old)+',LEGACY_KEYS)')));
  assert.equal(migrated.v,4);
  assert.deepEqual(Object.keys(migrated.w).sort(),['assume|v','deadline|n']);assert.equal(migrated.w['assume|v'].box,3);
  assert.deepEqual(migrated.hard,{'deadline|n':1});
  assert.deepEqual(migrated.days['2026-09-19'].words,{'assume|v':1,'deadline|n':1});assert.deepEqual(migrated.days['2026-09-19'].remembered,{'assume|v':1});
  assert.deepEqual(migrated.journey.plan.review,['assume|v']);assert.deepEqual(migrated.journey.plan.reviewed,{'assume|v':1});
  assert.deepEqual(migrated.daily.tasks.map(t=>t.id),['learn']);
  assert.equal(run('W(WORDS.findIndex(w=>w[0]==="deadline"))'),undefined);
  run('S=LearningCore.validate('+JSON.stringify(old)+',LEGACY_KEYS)');
  assert.equal(run('W(WORDS.findIndex(w=>w[0]==="deadline")).box'),1,'слово дополнительного словаря видит перенесённый прогресс');
  assert.equal(run('isHard(WORDS.findIndex(w=>w[0]==="deadline"))'),true);
  const again=JSON.parse(run('JSON.stringify(LearningCore.validate(JSON.parse(JSON.stringify(S)),LEGACY_KEYS))'));
  assert.deepEqual(Object.keys(again.w).sort(),['assume|v','deadline|n'],'повторная проверка v4 ничего не меняет');
  assert.throws(()=>core.validate({...old,v:3}),/повреждена/,'задание «уровень» недопустимо после переноса в v4');
});
test('практика: сочетания и близкие пары ссылаются на слова программы, задания выбирают нужные слова',()=>{
  const run=app();
  assert.equal(run('Object.keys(PRACTICE).filter(k=>!(k in KEY_INDEX)).length'),0);
  assert.equal(run('CONFUSABLES.every(p=>p.length===2&&p.every(k=>k in KEY_INDEX))'),true);
  assert.ok(run('CONFUSABLES.length')>=40);
  const say=run('WORDS.findIndex((w,i)=>WORD_KEYS[i]==="say|v")'),tell=run('WORDS.findIndex((w,i)=>WORD_KEYS[i]==="tell|v")');
  assert.equal(run('confusablePartners('+say+').length'),0,'пара закрыта, пока второе слово не начато');
  run('S.w[wk('+tell+')]={box:2,due:today(),ok:1,bad:0}');
  assert.deepEqual(JSON.parse(run('JSON.stringify(confusablePartners('+say+'))')),[tell]);
  assert.equal(run('hasCollocations('+say+')'),true);
  assert.equal(run('gapSentences('+say+').length'),1,'запасные примеры только после верного ответа или для сложных слов');
  run('S.hard[wk('+say+')]=1');assert.ok(run('gapSentences('+say+').length')>1);
});
test('в каждом тематическом маршруте ровно 100 слов, уровни только из подтверждённого словаря',()=>{
  const ctx={};vm.createContext(ctx);
  vm.runInContext(['words-a.js','words-b.js','ex-ru.js','word-levels.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js','thematic-data.js'].map(read).join(';')+';this.data={meta:THEMATIC_META,words:THEMATIC_WORDS,pick:THEMATIC_PICK}',ctx);
  assert.equal(ctx.data.meta.length,10);
  for(const meta of ctx.data.meta){
    const words=ctx.data.words[meta.id];
    assert.equal(words.length,100,meta.id);assert.equal(new Set(words.map(w=>w[0])).size,100,meta.id);
    assert.equal(words.every(w=>w.length===6&&w.slice(0,5).every(Boolean)),true,meta.id);
    for(const w of words)assert.equal(w[5],require("../word-levels").lookup(w[0],w[2])?.level||null,meta.id+": "+w[0]);
    // добор — только явные тематические ключи; чужие слова прежних срезов по индексам не попадают в маршрут
    assert.ok(ctx.data.pick[meta.id].length>=20,meta.id);
    for(const w of words)assert.equal(["browser","spam","hack","subscribe","gossip","rumour","whisper","parliament","democracy","mortgage","invoice"].includes(w[0]),false,meta.id+": "+w[0]);
  }
  assert.equal(read('thematic-data.js').includes('THEMATIC_REUSE'),false);
});
test('копия не включает ключи или настройки голосов и не меняет оригинал',()=>{
  const s=core.empty();s.set.ttsKeys={google:'test-secret'};s.set.tts={en:{engine:'google'}};
  const out=core.portable(s);assert.equal(JSON.stringify(out).includes('test-secret'),false);assert.equal(out.set,undefined);assert.equal(s.set.ttsKeys.google,'test-secret');
  const restored=core.prepareImport(out,s);assert.equal(restored.set.ttsKeys.google,'test-secret');
});
test('старые копии совместимы, чужие ключи не импортируются',()=>{
  const old=core.empty();old.set.ttsKeys={google:'source-key'};old.w.assume={box:3,due:'2026-09-14',ok:3,bad:1};
  const local=core.empty();local.set.ttsKeys={google:'destination-key'};
  const imported=core.prepareImport(old,local);assert.equal(imported.w.assume.box,3);assert.equal(imported.set.ttsKeys.google,'destination-key');
  assert.deepEqual(imported.thematic,core.thematicEmpty());
});
function readyThematicTopic(){
  const state=core.empty(),topic=core.thematicTopic(state,'forest');
  const words=Array.from({length:100},(_,i)=>`forest-${i+1}`);
  words.forEach(word=>core.thematicIntroduce(topic,word,'2026-09-15'));
  return {state,topic,words};
}
test('тематический маршрут хранит отдельный прогресс и открывает блиц после знакомства со 100 словами',()=>{
  const {state,topic,words}=readyThematicTopic();
  assert.equal(core.thematicExamReady(topic),true);
  assert.equal(Object.values(topic.words).every(r=>r.box===0),true);
  assert.deepEqual(state.w,{});
  const copy=core.portable(state);
  assert.equal(Object.keys(copy.thematic.topics.forest.introduced).length,100);
  assert.deepEqual(copy.w,{});
  assert.equal(words.length,100);
});
test('блиц перемешивает все 100 слов без повторений',()=>{
  const {topic,words}=readyThematicTopic();
  const active=core.thematicExamStart(topic,words,1800000000000,50000,()=>0);
  assert.equal(active.order.length,100);
  assert.equal(new Set(active.order).size,100);
  assert.deepEqual([...active.order].sort(),[...words].sort());
  assert.notDeepEqual(active.order,words);
});
test('пять ошибок проваливают блиц и включают блокировку на 30 минут',()=>{
  const {topic,words}=readyThematicTopic(),start=1800000000000;
  core.thematicExamStart(topic,words,start,50000,()=>0.5);
  for(let i=0;i<4;i++)assert.equal(core.thematicExamAnswer(topic,false,start+i+1,50001+i).status,'active');
  const failed=core.thematicExamAnswer(topic,false,start+5,50005);
  assert.equal(failed.status,'failed');assert.equal(failed.errors,5);
  assert.equal(failed.lockedUntil,start+5+core.THEMATIC_COOLDOWN_MS);
  assert.equal(core.thematicExamCooldown(topic,start+5),core.THEMATIC_COOLDOWN_MS);
  assert.throws(()=>core.thematicExamStart(topic,words,start+1000,51000));
  assert.doesNotThrow(()=>core.thematicExamStart(topic,words,failed.lockedUntil,60000));
});
test('время идёт в фоне: пять пропущенных ответов сразу завершают блиц',()=>{
  const {topic,words}=readyThematicTopic(),start=1800000000000;
  core.thematicExamStart(topic,words,start,10000);
  const result=core.thematicExamTick(topic,start+30000,40000);
  assert.equal(result.status,'failed');assert.equal(result.missed,5);assert.equal(result.reason,'errors');
  assert.equal(topic.exam.lockedUntil,start+30000+core.THEMATIC_COOLDOWN_MS);
});
test('ответ после истечения шести секунд не засчитывается поверх пропуска',()=>{
  const {topic,words}=readyThematicTopic(),start=1800000000000;
  core.thematicExamStart(topic,words,start,10000);
  const result=core.thematicExamAnswer(topic,true,start+6000,16000);
  assert.equal(result.status,'active');assert.equal(result.missed,1);
  assert.equal(topic.exam.active.index,1);assert.equal(topic.exam.active.correct,0);assert.equal(topic.exam.active.errors,1);
});
test('полный блиц с четырьмя ошибками засчитывается, прерывание считается провалом',()=>{
  const first=readyThematicTopic(),start=1800000000000;
  core.thematicExamStart(first.topic,first.words,start,10000);
  let result;
  for(let i=0;i<100;i++)result=core.thematicExamAnswer(first.topic,i>=4,start+i+1,10001+i);
  assert.equal(result.status,'passed');assert.equal(result.errors,4);
  assert.equal(first.topic.exam.passedAt,start+100);assert.equal(first.topic.exam.lockedUntil,null);
  const second=readyThematicTopic();core.thematicExamStart(second.topic,second.words,start,10000);
  const aborted=core.thematicExamAbort(second.topic,start+1000);
  assert.equal(aborted.status,'failed');assert.equal(aborted.reason,'aborted');
  assert.equal(aborted.lockedUntil,start+1000+core.THEMATIC_COOLDOWN_MS);
});
test('повреждённые данные отклоняются до записи',()=>{
  assert.throws(()=>core.validate({v:2}));
  for(const bad of [{box:7,due:'2026-09-14',ok:0,bad:0},{box:0,due:'2026-02-30',ok:0,bad:0},{box:0,due:'2026-09-14',ok:-1,bad:0}]){const s=core.empty();s.w.assume=bad;assert.throws(()=>core.validate(s));}
  const s=core.empty();s.stats={modesDone:[]};assert.throws(()=>core.validate(s));
  assert.throws(()=>core.validate(JSON.parse('{"v":2,"__proto__":{}}')));
});
test('незаконченное занятие переживает перезапуск, но не переносится как активное',()=>{
  const run=app();const raw=run('JSON.stringify(journeyPlan())');const s=core.empty();s.journey={completed:{},rewards:{},plan:JSON.parse(raw)};
  assert.ok(core.validate(s).journey.plan);assert.equal(core.portable(s).journey.plan,undefined);
});
test('день практики учитывает уникальные слова, включая повторение',()=>{
  const run=app();assert.equal(run('grade(0,true,"mc");grade(0,true,"mc");grade(1,true,"mc");activityCount()'),2);
});
test('ошибка повторяется внутри обычной сессии максимум один раз',()=>{
  const run=app();assert.equal(run('sess={items:[{i:0,kind:"mc"},{i:1,kind:"mc"}],k:0,res:[],retried:{},mode:"mc"};record(0,false,"mc");sess.k=2;record(0,false,"mc");sess.items.length'),3);
});
test('завершённое занятие отмечает учебный день один раз',()=>{
  const run=app();assert.equal(run('lessonComplete();lessonComplete();Object.keys(S.journey.completed).length'),1);
});
test('устаревшие неизвестные поля не переносятся из резервной копии',()=>{
  const state=core.empty();state.obsoleteState={unused:true};
  const copy=core.portable(state);assert.equal(copy.obsoleteState,undefined);
  assert.equal(core.prepareImport({...copy,obsoleteState:{unused:true}},core.empty()).obsoleteState,undefined);
});
test('Путь Oxford 3000 показывает закреплённые слова, уровни и недельный ритм',()=>{
  const run=app();
  run('S.w[wk(0)]={box:6,due:addDays(today(),60),ok:8,bad:0};S.journey={completed:{},rewards:{}};S.journey.completed[today()]=1;S.journey.completed[addDays(today(),-2)]=1;');
  const html=run('motivationCardHtml()');
  assert.match(html,/Путь Oxford 3000/);assert.ok(html.includes('1 / 3000'));assert.ok(html.includes('2/4'));
  for(const level of ['A1','A2','B1','B2'])assert.ok(html.includes('>'+level+'<'));
});
test('обязательные ресурсы PWA и APK присутствуют',()=>{
  const ctx={self:{addEventListener(){}},location:{},importScripts(){throw Error('service worker не должен импортировать дополнительные сценарии');}};vm.createContext(ctx);vm.runInContext(read('sw.js')+';this.files=FILES',ctx);
  for(const asset of ctx.files)assert.ok(fs.existsSync(path.join(root,asset)),asset);
  for(const asset of ['learning-core.js','score-core.js','journey.js','motivation.css','word-forms.js','progress-storage.js','thematic.css','thematic.js','thematic-data.js','competition.css','competition-config.js','competition.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js'])assert.ok(read('tools/build-web.js').includes('"'+asset+'"'),asset);
});
test('APK использует монотонные часы Android и подтверждает выход из блица',()=>{
  const activity=read('android/app/src/main/java/io/github/teninz/shadowfox/MainActivity.java'),clock=read('android/app/src/main/java/io/github/teninz/shadowfox/ClockPlugin.java'),native=read('native.js');
  assert.ok(activity.includes('registerPlugin(ClockPlugin.class)'));
  assert.ok(clock.includes('SystemClock.elapsedRealtime()'));
  assert.ok(native.includes('window.nativeExamClock'));
  assert.ok(native.includes('thematicRequestExamExit("thematic")'));
});
