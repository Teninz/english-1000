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
  for(const f of ['learning-core.js','word-forms.js','progress-storage.js','journey.js','words-a.js','words-b.js','ex-ru.js'])vm.runInContext(read(f),ctx,{filename:f});
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
test('1000 уникальных слов, все примеры переводятся и подходят для пропуска',()=>{
  const run=app();assert.equal(run('WORDS.length'),1000);assert.equal(run('new Set(WORDS.map(w=>w[0])).size'),1000);
  assert.equal(run('WORDS.filter(w=>!EX_RU[w[0]]).length'),0);
  assert.equal(run('JSON.stringify(WORDS.filter(w=>!wordRegex(w[0]).test(w[3])).map(w=>w[0]))'),'[]');
  assert.equal(run('Object.entries(WORD_CONTEXT).filter(([w,c])=>!WORDS.some(x=>x[0]===w)||!c.ru||!wordRegex(w).test(c.example)).length'),0);
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
  const ctx={self:{addEventListener(){}},location:{}};vm.createContext(ctx);vm.runInContext(read('sw.js')+';this.files=FILES',ctx);
  for(const file of ctx.files)assert.ok(fs.existsSync(path.join(root,file)),file);
  for(const file of ['learning-core.js','journey.js','word-forms.js','progress-storage.js','companion.css'])assert.ok(read('tools/build-web.js').includes('"'+file+'"'),file);
});
test('анимации компаньона являются валидными компактными APNG',()=>{
  const timingBlock=read('journey.js').match(/const FOX_ANIMATION_MS = \{([^}]+)\}/)[1];
  const timers=Object.fromEntries([...timingBlock.matchAll(/(\w+):(\d+)/g)].map(m=>[m[1],+m[2]]));
  const names=['idle','listen','pet','feed','happy','quiet','sad','withdrawn','stretch','drink','yawn','sleep','hungry','thirsty','offended','lesson'];
  let totalSize=0;
  for(const name of names){
    const file=path.join(root,'art','companion-anim',name+'.png'),data=fs.readFileSync(file);
    totalSize+=data.length;
    assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16),128);assert.equal(data.readUInt32BE(20),128);
    let offset=8,declared=0,frames=0,duration=0;
    while(offset<data.length){const length=data.readUInt32BE(offset),type=data.toString('ascii',offset+4,offset+8);if(type==='acTL')declared=data.readUInt32BE(offset+8);if(type==='fcTL'){frames++;const num=data.readUInt16BE(offset+28),den=data.readUInt16BE(offset+30)||100;duration+=1000*num/den;}offset+=12+length;}
    assert.ok(frames>=36,name);assert.equal(frames,declared,name);assert.ok(data.length<500_000,name);
    assert.ok(Math.abs(timers[name]-duration)<2,`${name}: таймер ${timers[name]} мс, APNG ${duration} мс`);
  }
  assert.ok(totalSize<5_000_000,`общий размер анимаций: ${totalSize}`);
});
test('лиса открывается отдельной панелью, инфографика сложена после заданий',()=>{
  const html=read('index.html'),home=html.slice(html.indexOf('function renderHome'),html.indexOf('function kindForBox'));
  assert.ok(html.includes('id="foxHandle"'));assert.ok(html.includes('id="foxDrawerHost"'));
  assert.equal(home.includes('${companionCardHtml()}'),false);assert.equal(home.includes('${journeyHeroHtml()}'),false);
  assert.ok(home.indexOf('${dailyCardHtml()}')<home.indexOf('${progressAccordionHtml()}'));
  assert.ok(read('journey.js').includes('<details class="card progress-accordion">'));
});
test('Android-виджет использует те же четыре состояния модели, что и приложение',()=>{
  const kotlin=read('android/app/src/main/java/io/github/teninz/shadowfox/CompanionWidget.kt');
  for(const name of ['idle','sad_1','sad_2','withdrawn']){
    assert.ok(kotlin.includes('R.drawable.companion_'+name),name);
    const file=path.join(root,'android','app','src','main','res','drawable-nodpi','companion_'+name+'.png');
    assert.ok(fs.existsSync(file),file);const data=fs.readFileSync(file);assert.ok(data.length>1_000,file);
    assert.equal(data.readUInt32BE(16),128);assert.equal(data.readUInt32BE(20),128);
  }
  assert.ok(read('android/app/src/main/res/layout/companion_widget.xml').includes('@drawable/companion_idle'));
  assert.ok(kotlin.includes('R.id.fox_water'));
});
