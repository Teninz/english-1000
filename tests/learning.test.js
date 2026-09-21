const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../learning-core');
const foxMotion=require('../fox-motion');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const add=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10);
function app(){
  const store=new Map();
  const ctx={console,Date,URLSearchParams,setTimeout:()=>0,clearTimeout(){},window:{},navigator:{},TTS:{stop(){}},document:{querySelector:()=>({}),querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},checkAch(){},dailyEvent(){}};
  vm.createContext(ctx);
  for(const f of ['learning-core.js','word-forms.js','progress-storage.js','journey.js','words-a.js','words-b.js','ex-ru.js','word-levels.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js','thematic-data.js'])vm.runInContext(read(f),ctx,{filename:f});
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
  assert.equal(migrated.v,3);
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
  assert.deepEqual(Object.keys(again.w).sort(),['assume|v','deadline|n'],'повторная проверка v3 ничего не меняет');
  assert.throws(()=>core.validate({...old,v:3}),/повреждена/,'задание «уровень» недопустимо в v3');
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
test('новая лиса не грустит до первого занятия',()=>{
  assert.equal(core.petMood(core.petEmpty(),'2030-01-01').mood,0);
});
test('настроение меняется через 1, 2, 3 полных пропущенных дня',()=>{
  const p=core.petEmpty();p.completed['2026-09-14']=1;
  assert.deepEqual(['14','15','16','17','18'].map(d=>core.petMood(p,'2026-09-'+d).mood),[0,0,1,2,3]);
  assert.equal(core.petMood(p,'2026-09-13').mood,0);
});
test('смена месяца и года не ломает настроение',()=>{
  const p=core.petEmpty();p.completed['2025-12-31']=1;assert.equal(core.petMood(p,'2026-01-04').mood,3);
  p.completed={'2026-03-07':1};assert.equal(core.petMood(p,'2026-03-11').mood,3);
});
test('замкнувшаяся лиса не расходует угощения и не принимает ласку',()=>{
  const p=core.petEmpty();p.completed['2026-09-14']=1;
  for(const action of ['feed','water','pet'])assert.deepEqual(core.petAction(p,action,'2026-09-18').state,p);
  p.completed['2026-09-18']=1;assert.equal(core.petMood(p,'2026-09-18').mood,0);assert.equal(core.petAction(p,'feed','2026-09-18').state.fed,1);
});
test('вода доступна без расходников, а старое сохранение дополняется полями ухода',()=>{
  let p=core.petEmpty();p=core.petAction(p,'water','2026-09-14').state;p=core.petAction(p,'water','2026-09-14').state;
  assert.equal(p.watered,2);assert.equal(p.lastWater,'2026-09-14');assert.equal(p.lastAction.kind,'water');
  const s=core.empty();s.companion={completed:{},fed:0,pets:0,lastAction:null};
  const restored=core.validate(s).companion;assert.equal(restored.watered,0);assert.equal(restored.lastFed,null);assert.equal(restored.lastWater,null);
  assert.deepEqual(restored.identity,core.petIdentityEmpty());
});
test('пол, имя и склонения компаньона сохраняются и используются в репликах',()=>{
  assert.deepEqual(core.petNameForms('Фокс','male',true),{nom:'Фокс',gen:'Фокса',dat:'Фоксу',acc:'Фокса',ins:'Фоксом',prep:'Фоксе'});
  assert.deepEqual(core.petNameForms('Луна','female',true),{nom:'Луна',gen:'Луны',dat:'Луне',acc:'Луну',ins:'Луной',prep:'Луне'});
  assert.equal(core.petNameForms('Лаки','male',true).gen,'Лаки');
  const s=core.empty();s.companion=core.petEmpty();s.companion.identity=core.petIdentity({sex:'male',name:'Фокс',decline:true,forms:{gen:'Фокса'}});
  const restored=core.prepareImport(core.portable(s),core.empty()).companion;
  assert.equal(restored.identity.sex,'male');assert.equal(restored.identity.forms.gen,'Фокса');assert.equal(core.petTerm(restored,'dat'),'Фоксу');
  assert.match(core.petAction(restored,'water','2026-09-14').message,/Фокс напился/);
});
test('кормление не приносит новые угощения, законченные занятия не дублируются за день',()=>{
  let p=core.petEmpty();p=core.petAction(p,'feed','2026-09-14').state;p=core.petAction(p,'feed','2026-09-14').state;
  assert.equal(core.petAction(p,'feed','2026-09-14').state.fed,2);
  const run=app();assert.equal(run('lessonComplete();lessonComplete();LearningCore.petMood(S.companion,today()).treats'),3);
  assert.equal(run('Object.keys(S.journey.completed).length'),1);
});
test('награды сохраняются после перерыва и переносятся с лисой',()=>{
  const s=core.empty();s.journey={completed:{'2026-09-14':1},rewards:{hello:'2026-09-14'}};s.companion=core.petEmpty();s.companion.completed=s.journey.completed;
  assert.equal(core.petMood(s.companion,'2026-10-01').mood,3);assert.equal(core.prepareImport(core.portable(s),core.empty()).journey.rewards.hello,'2026-09-14');
});
test('обязательные ресурсы PWA и APK присутствуют',()=>{
  const ctx={self:{addEventListener(){}},location:{},importScripts(file){vm.runInContext(read(file.replace('./','')),ctx);}};vm.createContext(ctx);vm.runInContext(read('sw.js')+';this.files=FILES',ctx);
  for(const file of ctx.files)assert.ok(fs.existsSync(path.join(root,file)),file);
  for(const file of ['learning-core.js','fox-motion.js','journey.js','word-forms.js','progress-storage.js','companion.css','thematic.css','thematic.js','thematic-data.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js'])assert.ok(read('tools/build-web.js').includes('"'+file+'"'),file);
});
test('лисы v2: набор клипов, постеры и суточный цикл сцены соответствуют манифесту',()=>{
  const manifest=JSON.parse(read('art/companion-v2/manifest.json'));
  assert.ok(read('art/companion-v2/manifest.js').startsWith('// Генерируется'));assert.ok(read('art/companion-v2/manifest.js').includes('const FOX_PACK = '));
  const webm=file=>{const data=fs.readFileSync(file);assert.deepEqual([...data.subarray(0,4)],[0x1a,0x45,0xdf,0xa3],file);assert.ok(data.length>10_000&&data.length<3_500_000,file);return data.length;};
  let total=0;
  for(const fox of core.petFoxes){
    const entry=manifest.foxes[fox.id];assert.ok(entry,fox.id);assert.equal(entry.sex,fox.sex);
    assert.equal(fs.readFileSync(path.join(root,'art','companion-v2',fox.id,'poster.webp')).toString('ascii',0,4),'RIFF');
    const clips=Object.keys(entry.clips);
    if(fox.available)assert.ok(clips.length>=1,`${fox.id}: у доступной лисы должны быть клипы`);
    else assert.equal(clips.length,0,`${fox.id}: у запертой лисы клипов быть не должно`);
    const onDisk=fs.readdirSync(path.join(root,'art','companion-v2',fox.id)).filter(f=>f.endsWith('.webm')).map(f=>f.slice(0,-5)).sort();
    assert.deepEqual(onDisk,clips.slice().sort(),`${fox.id}: файлы на диске не совпадают с манифестом`);
    for(const [clip,c] of Object.entries(entry.clips)){total+=webm(path.join(root,'art','companion-v2',fox.id,clip+'.webm'));assert.ok(['loop','oneshot','transition'].includes(c.kind),clip);assert.ok(c.frames>=48,clip);}
    if(entry.clips.sleep)assert.ok(fs.existsSync(path.join(root,'art','companion-v2',fox.id,'poster-sleep.webp')));
  }
  const bold=manifest.foxes['04-boy-bold'].clips;
  for(const clip of ['calm1','calm2','calm3','calm4','calm5','touch','sad-idle','sad1','sad2','offended-idle','offended1','lie-down','fall-asleep','sleep','sleep-touch','wake-up'])assert.ok(bold[clip],clip);
  assert.equal(bold['calm-idle'],undefined,'петля с мерцающим фоном убрана');
  for(const kind of ['sad','offended','sleep'])assert.ok(fs.existsSync(path.join(root,'art','companion-v2','04-boy-bold',`poster-${kind}.webp`)),kind);
  assert.deepEqual(Object.keys(manifest.foxes['04-boy-bold'].sets).sort(),['calm','offended','sad']);
  assert.equal(bold.sleep.kind,'loop');assert.equal(bold['wake-up'].kind,'transition');
  for(const period of ['morning','day','evening','night']){
    assert.ok(manifest.scene.periods[period].length>=1,period);
    assert.ok(fs.existsSync(path.join(root,'art','companion-v2','scene',period+'.webp')),period);
    for(const loop of manifest.scene.periods[period])total+=webm(path.join(root,'art','companion-v2','scene',loop.file+'.webm'));
  }
  for(const name of ['morning-day','day-evening','evening-night','night-morning']){assert.ok(manifest.scene.transitions[name],name);total+=webm(path.join(root,'art','companion-v2','scene',name+'.webm'));}
  const handle=fs.readFileSync(path.join(root,'art','companion-v2','handle.png'));assert.deepEqual([...handle.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(handle.readUInt32BE(16),192);
  assert.ok(total<32_000_000,`общий размер набора: ${total}`);
  assert.deepEqual(core.petFoxes.filter(f=>f.available).map(f=>f.id),['04-boy-bold']);
  assert.ok(read('sw.js').includes('importScripts("./art/companion-v2/manifest.js")'));
  assert.ok(read('index.html').includes('<script src="art/companion-v2/manifest.js"></script>'));
  assert.ok(read('companion.css').includes('.fox-scene:not(.on){opacity:0'),'пустое запасное видео сцены скрыто (серый прямоугольник в WebView)');
  assert.ok(read('tools/build-web.js').includes('"companion-references"'));
  // в APK клипов нет: их скачивает foxPackStore с GitHub Releases; сайт отдаёт файлы из репозитория
  assert.equal(manifest.bundled,true,'клипы упакованы в APK');assert.equal(read('tools/build-web.js').includes('src.endsWith(".webm")'),false,'webm не исключаются из APK');
  assert.equal(read('sw.js').includes('.webm`'),false,'service worker не должен предзагружать клипы');
  const native=read('native.js');assert.ok(native.includes('window.foxPackStore'));assert.ok(native.includes('!FOX_PACK.bundled'));assert.ok(native.includes('releases/download/fox-pack-'));assert.ok(native.includes('FS.downloadFile'));
  assert.ok(read('package.json').includes('@capacitor/filesystem'));
  const run=app();run(read('art/companion-v2/manifest.js'));
  const files=run('JSON.stringify(foxPackFiles())');assert.equal(JSON.parse(files).length,Object.keys(manifest.foxes['04-boy-bold'].clips).length,'в набор входят только клипы лисы');
  assert.ok(JSON.parse(files).every(f=>f.kb>0&&f.path.startsWith('04-boy-bold/')));
  assert.equal(run('foxPackReady()'),true,'без хранилища (сайт) набор считается доступным');
  run('window.foxPackStore={ready:()=>false,url:()=>null,status:()=>({state:"missing",percent:0,error:""})}');
  assert.equal(run('foxPackReady()'),false);assert.equal(run('foxClipNames(LearningCore.petFox("04-boy-bold")).length'),0);
  assert.ok(run('S.companion=LearningCore.petEmpty();S.companion.fox="04-boy-bold";S.companion.identity=LearningCore.petIdentity({sex:"male",name:"Фокс"});journeyState();foxStageHtml(foxCurrent(),0,"x")').includes('<img class="fox-clip on"'),'без набора — постер');
  assert.ok(run('foxPackCardHtml()').includes('id="foxPackDownload"'));
  run('window.foxPackStore={ready:()=>true,url:p=>"file://"+p,status:()=>({state:"ready",percent:100,error:""})}');
  assert.equal(run('foxAsset(foxCurrent(),"calm1")'),'file://04-boy-bold/calm1.webm');
  assert.ok(run('foxPackCardHtml()').includes('id="foxPackRemove"'));
  run('delete window.foxPackStore');
});
test('время суток лисы берётся из часов устройства, переход показывается один раз при смене периода',()=>{
  const run=app();
  run(read('art/companion-v2/manifest.js'));
  const at=(h,m)=>run(`foxPeriod(new Date(2026,8,17,${h},${m}))`);
  assert.ok(read('about.js').includes('"1.0.2.3"')&&read('about.js').includes('"1.0.3.0"')&&read('about.js').includes('"1.0.3.1"')&&read('about.js').includes('"1.0"'),'список версий с 1.0');assert.ok(read('about.js').includes('about-more'));
  assert.equal(at(7,29),'night');assert.equal(at(7,30),'morning');assert.equal(at(12,29),'morning');assert.equal(at(12,30),'day');
  assert.equal(at(19,29),'day');assert.equal(at(19,30),'evening');assert.equal(at(23,29),'evening');assert.equal(at(23,30),'night');assert.equal(at(3,0),'night');
  assert.equal(run('foxPeriodTransition("day","evening")'),'day-evening');assert.equal(run('foxPeriodTransition("night","morning")'),'night-morning');assert.equal(run('foxPeriodTransition("morning","evening")'),null);
  run('S.companion=LearningCore.petEmpty();S.companion.fox="04-boy-bold";S.companion.identity=LearningCore.petIdentity({sex:"male",name:"Фокс"});journeyState();');
  assert.equal(run('foxOpenTransition("evening")'),null,'первый визит — без перехода');
  run('S.journey.foxSeen={day:today(),period:"day"}');
  assert.equal(JSON.stringify(run('foxOpenTransition("evening")')),'{"seen":"day","hop":"day"}');
  run('S.journey.foxSeen={day:today(),period:"morning"}');
  assert.equal(JSON.stringify(run('foxOpenTransition("evening")')),'{"seen":"morning","hop":"day"}','пропущенный период — показывается последний переход');
  run('S.journey.foxSeen={day:today(),period:"evening"}');
  assert.equal(run('foxOpenTransition("evening")'),null,'тот же период — без перехода');
  const html=run('S.journey.foxSeen={day:today(),period:"day"};foxStageHtml(foxCurrent(),0,"x")');
  assert.ok(/data-transition="(day-evening|evening-night|night-morning|morning-day|)"/.test(html));
  run('S.journey.foxSeen={day:today(),period:"night"}');
  const wake=run('foxStageHtml(foxCurrent(),0,"x")');
  if(run('foxPeriod()')!=='night')assert.ok(wake.includes('data-mode="asleep"'),'после ночного визита лиса просыпается на глазах');
  assert.ok(run('foxStageHtml(foxCurrent(),0,"x")').includes('poster'));
  assert.equal(run('foxMoodSet(0)'),'calm');assert.equal(run('foxMoodSet(1)'),'sad');assert.equal(run('foxMoodSet(2)'),'sad');assert.equal(run('foxMoodSet(3)'),'offended');
  const sets=JSON.parse(run('JSON.stringify({calm:foxSet("calm"),sad:foxSet("sad"),offended:foxSet("offended")})'));
  assert.equal(sets.calm.idle,null);assert.ok(sets.calm.active.length>=4);assert.equal(sets.calm.touch,'touch');
  assert.equal(sets.sad.idle,'sad-idle');assert.ok(sets.sad.active.includes('sad1'));assert.equal(sets.offended.idle,'offended-idle');assert.ok(sets.offended.active.includes('offended1'));
  assert.ok(run('foxStageHtml(foxCurrent(),1,"x")').includes('data-set="sad"'));assert.ok(run('foxStageHtml(foxCurrent(),3,"x")').includes('data-set="offended"'));
  assert.equal(run('companionCardHtml()').includes('id="foxFeed"'),false,'кнопок еды/воды/ласки больше нет');
});
test('выбор лисы и постоянное имя переживают сохранение, импорт и родную синхронизацию',()=>{
  const s=core.empty();s.companion=core.petEmpty();
  assert.equal(s.companion.fox,null);
  s.companion.fox='04-boy-bold';s.companion.adopted='2026-09-16';s.companion.identity=core.petIdentity({sex:'male',name:'Фокс'});
  const imported=core.prepareImport(core.portable(s),core.empty());
  assert.equal(imported.companion.fox,'04-boy-bold');assert.equal(imported.companion.adopted,'2026-09-16');assert.equal(imported.companion.identity.forms.gen,'Фокса');
  assert.throws(()=>core.prepareImport({...core.portable(s),companion:{...s.companion,fox:'05-unknown'}},core.empty()));
  const legacy=core.prepareImport({...core.portable(s),companion:{completed:{},fed:0,pets:0}},core.empty());
  assert.equal(legacy.companion.fox,null);assert.equal(legacy.companion.adopted,null);
  const native={completed:{},fed:1,watered:0,pets:0,lastFed:null,lastWater:null,lastAction:null,identity:core.petIdentity({sex:'male',name:'Фокс'})};
  const kept=core.petKeepChoice(native,s.companion);assert.equal(kept.fox,'04-boy-bold');assert.equal(kept.adopted,'2026-09-16');
  assert.equal(core.petAction(s.companion,'pet','2026-09-16').state.fox,'04-boy-bold');
  const run=app();
  assert.equal(run('S.companion=LearningCore.petEmpty();foxReady()'),false);
  assert.equal(run('S.companion.fox="03-girl-gentle";S.companion.identity=LearningCore.petIdentity({sex:"female",name:"Луна"});foxReady()'),true);
  assert.equal(run('foxAsset(foxCurrent(),"calm1")'),'art/companion-v2/03-girl-gentle/calm1.webm');
  assert.ok(run('companionChooserHtml()').includes('Будет добавлено позднее'));
  assert.ok(run('companionChooserHtml()').includes('fox-sex male'));
  assert.ok(run('companionCardHtml()').includes('Бета-версия компаньона'));
});
test('эталонная цепочка имеет ровную абсолютную шкалу 20 FPS',()=>{
  const plan=JSON.parse(read('tools/companion-source/reference-chain-v1.motion.json'));
  assert.equal(plan.fps,20);assert.equal(plan.frameCount,100);assert.equal(plan.durationMs,5000);assert.equal(plan.frames.length,100);
  assert.deepEqual(plan.frames[0].pose,plan.frames.at(-1).pose);
  assert.equal(foxMotion.frameAt(0,100),0);assert.equal(foxMotion.frameAt(49.999,100),0);assert.equal(foxMotion.frameAt(50,100),1);assert.equal(foxMotion.frameAt(4999,100),99);assert.equal(foxMotion.frameAt(5000,100,20,true),0);
  let now=0,next,ended,shown=[];
  const clock=new foxMotion.Clock({now:()=>now,raf:callback=>{next=callback;return 1;},caf(){},onFrame:(frame,stats)=>shown.push([frame,stats.dropped]),onEnd:stats=>ended=stats});
  clock.play(4);next(0);next(50);next(200);
  assert.deepEqual(shown,[[0,0],[1,0],[3,1]]);assert.equal(ended.duration,200);assert.equal(ended.dropped,1);assert.equal(ended.maxGapMs,150);
});
test('эталонные ключевые кадры имеют общий холст и безопасные границы',()=>{
  const names=['idle','notice','focus','happy','happy-hold','settle','idle-return'];
  for(const name of names){
    const file=path.join(root,'tools','companion-source','reference-keyframes',`${name}.png`);
    assert.ok(fs.existsSync(file),name);
    const data=fs.readFileSync(file);assert.equal(data.readUInt32BE(16),256,name);assert.equal(data.readUInt32BE(20),256,name);
  }
});
test('лиса открывается отдельной панелью, инфографика сложена после заданий',()=>{
  const html=read('index.html'),home=html.slice(html.indexOf('function renderHome'),html.indexOf('function kindForBox'));
  assert.ok(html.includes('id="foxHandle"'));assert.ok(html.includes('id="foxDrawerHost"'));
  assert.equal(home.includes('${companionCardHtml()}'),false);
  // главная кнопка «Занятие на сегодня» с оценкой времени и показатели нагрузки — над остальными режимами
  assert.ok(home.indexOf('${journeyHeroHtml()}')<home.indexOf('${loadCardHtml()}'));assert.ok(home.indexOf('${loadCardHtml()}')<home.indexOf('id="hLearn"'));
  assert.ok(read('journey.js').includes('journeyHeroHtml("foxJourney")'),'в домике лисы своя кнопка');
  assert.ok(home.indexOf('${dailyCardHtml()}')<home.indexOf('${progressAccordionHtml()}'));
  assert.ok(home.indexOf('${dailyCardHtml()}')<home.indexOf('${thematicHomeCardHtml()}'));
  assert.ok(home.indexOf('${thematicHomeCardHtml()}')<home.indexOf('${progressAccordionHtml()}'));
  assert.ok(read('journey.js').includes('<details class="card progress-accordion">'));
  assert.ok(read('journey.js').includes('id="foxIdentity"'));
  assert.ok(read('journey.js').includes('LearningCore.petNameForms'));
});
test('Android-виджет использует те же четыре состояния модели, что и приложение',()=>{
  const kotlin=read('android/app/src/main/java/io/github/teninz/shadowfox/CompanionWidget.kt');
  for(const name of ['idle','sad_1','sad_2','withdrawn','sleep']){
    assert.ok(kotlin.includes('R.drawable.companion_'+name),name);
    const file=path.join(root,'android','app','src','main','res','drawable-nodpi','companion_'+name+'.png');
    assert.ok(fs.existsSync(file),file);const data=fs.readFileSync(file);assert.ok(data.length>1_000,file);
    assert.equal(data.readUInt32BE(16),256);assert.equal(data.readUInt32BE(20),256);
  }
  const layout=read('android/app/src/main/res/layout/companion_widget.xml');
  assert.ok(layout.includes('@drawable/companion_idle'));assert.ok(layout.includes('fox_lesson'));
  for(const gone of ['fox_feed','fox_water','fox_pet'])assert.equal(layout.includes(gone),false,gone);
  assert.equal(kotlin.includes('R.id.fox_water'),false);assert.ok(kotlin.includes('companion_sleep'));
  const store=read('android/app/src/main/java/io/github/teninz/shadowfox/CompanionStore.kt');
  assert.ok(store.includes('.put("identity", identityEmpty())'));
  assert.ok(kotlin.includes('CompanionStore.title(state, mood)'));
});
test('APK использует монотонные часы Android и подтверждает выход из блица',()=>{
  const activity=read('android/app/src/main/java/io/github/teninz/shadowfox/MainActivity.java'),clock=read('android/app/src/main/java/io/github/teninz/shadowfox/ClockPlugin.java'),native=read('native.js');
  assert.ok(activity.includes('registerPlugin(ClockPlugin.class)'));
  assert.ok(clock.includes('SystemClock.elapsedRealtime()'));
  assert.ok(native.includes('window.nativeExamClock'));
  assert.ok(native.includes('thematicRequestExamExit("thematic")'));
});
