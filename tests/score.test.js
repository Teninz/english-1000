const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const core=require('../learning-core');
const score=require('../score-core');
const add=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10);

function answer(state,key,day,ok=true,assisted=false){
  const before=state.words[key]||{box:0,due:day,ok:0,bad:0},after=core.schedule(before,ok,day,add,assisted);state.words[key]=after;
  return score.awardWord(state.score,{scope:'main',key,before,after,day,assisted});
}
function fixture(day='2026-09-21'){return {score:score.ensure(score.empty(),day),words:{}};}

test('неделя определяется по ISO и меняется по понедельникам',()=>{
  assert.equal(score.weekId('2026-09-20'),'2026-W38');
  assert.equal(score.weekId('2026-09-21'),'2026-W39');
});

test('баллы выдаются только за впервые достигнутые плановые ячейки',()=>{
  const s=fixture(),key='apple|n';
  assert.equal(answer(s,key,'2026-09-21'),5);
  assert.equal(answer(s,key,'2026-09-21'),0,'второй ответ в тот же день');
  assert.equal(answer(s,key,'2026-09-22'),5);
  assert.equal(answer(s,key,'2026-09-25'),15,'третья ячейка: шаг + бонус «знаю»');
  assert.equal(score.current(s.score,'2026-09-25').points,25);
  answer(s,key,'2026-10-02',false);answer(s,key,'2026-10-02',true);
  assert.equal(answer(s,key,'2026-10-03'),0,'возврат на уже оплаченную ячейку не фармит баллы');
});

test('досрочные и подсказанные ответы не дают баллов',()=>{
  const s=fixture(),key='book|n';answer(s,key,'2026-09-21');
  const before=s.words[key],early=core.schedule(before,true,'2026-09-21',add);
  assert.equal(score.awardWord(s.score,{scope:'main',key,before,after:early,day:'2026-09-21'}),0);
  const hinted=core.schedule(before,true,'2026-09-22',add,true);
  assert.equal(score.awardWord(s.score,{scope:'main',key,before,after:hinted,day:'2026-09-22',assisted:true}),0);
});

test('условно известное слово получает только пять баллов после первой проверки',()=>{
  for(const initialBox of [5,6]){
    const s=fixture(),key='known-'+initialBox;
    s.words[key]={box:initialBox,due:'2026-09-21',ok:0,bad:0,known:1};
    score.markKnown(s.score,'main',key,initialBox,'2026-09-21');
    assert.equal(answer(s,key,'2026-09-21'),5);
    assert.equal(score.current(s.score,'2026-09-21').points,5);
    assert.equal(answer(s,key,'2026-09-21'),0,'повтор в тот же день не оплачивается');
  }
});

test('десять слов дают дневной бонус, четыре дня — недельный',()=>{
  const s=fixture();
  for(let i=0;i<10;i++)answer(s,'w'+i,'2026-09-21');
  let sum=score.current(s.score,'2026-09-21');assert.equal(sum.points,60);assert.equal(sum.dailyBonus,10);
  for(const [n,day] of ['2026-09-22','2026-09-23','2026-09-24'].entries())answer(s,'later'+n,day);
  sum=score.current(s.score,'2026-09-24');assert.equal(sum.activeDays,4);assert.equal(sum.weekBonus,25);assert.equal(sum.points,100);
});

test('дневной рейтинг ограничен двумястами баллами',()=>{
  const s=fixture();for(let i=0;i<50;i++)answer(s,'cap'+i,'2026-09-21');
  assert.equal(score.current(s.score,'2026-09-21').points,200);
});

test('блиц оплачивается один раз, сброс маршрута удаляет его баллы',()=>{
  const s=fixture();assert.equal(score.awardExam(s.score,'forest','2026-09-21'),50);assert.equal(score.awardExam(s.score,'forest','2026-09-21'),0);
  const old=s.score.epoch;score.resetScope(s.score,'thematic:forest','2026-09-21');assert.equal(score.current(s.score,'2026-09-21').points,0);assert.notEqual(s.score.epoch,old);assert.equal(s.score.sync.pendingReset,true);
});

test('сброс слова удаляет его недельные баллы и разрешает честное переизучение',()=>{
  const s=fixture(),key='reset|v';answer(s,key,'2026-09-21');assert.equal(score.current(s.score,'2026-09-21').points,5);
  score.resetWords(s.score,'main',[key],'2026-09-21');assert.equal(score.current(s.score,'2026-09-21').points,0);
  delete s.words[key];assert.equal(answer(s,key,'2026-09-21'),5);assert.equal(score.current(s.score,'2026-09-21').points,5);
});

test('полный сброс обнуляет архив и баллы, сохраняя профиль друзей',()=>{
  const s=fixture();s.score.profile.nickname='Юрий';s.score.profile.userId='u';s.score.sync.friends=[{id:'f',nickname:'Друг',points:10,updatedAt:null}];answer(s,'one','2026-09-21');
  const old=s.score.epoch,reset=score.resetAll(s.score,'2026-09-21');assert.equal(score.current(reset,'2026-09-21').points,0);assert.deepEqual(reset.archive,{});assert.equal(reset.profile.nickname,'Юрий');assert.equal(reset.sync.friends.length,1);assert.equal(reset.sync.pendingReset,true);assert.ok(reset.retiredEpochs.includes(old));
});

test('несколько сбросов сохраняют цепочку закрытых эпох',()=>{
  const s=fixture(),epochs=[s.score.epoch];score.resetWords(s.score,'main',['one'],'2026-09-21');epochs.push(s.score.epoch);score.resetScope(s.score,'main','2026-09-21');
  assert.deepEqual(s.score.retiredEpochs,epochs);assert.ok(!s.score.retiredEpochs.includes(s.score.epoch));
});

test('v3 переносится в v4, экспорт не переносит рейтинговый счёт',()=>{
  const old=core.empty();delete old.score;old.v=3;old.w={'word|n':{box:3,due:'2026-09-21',ok:3,bad:0}};
  const migrated=core.validate(old);assert.equal(migrated.v,4);assert.equal(migrated.score.version,1);
  score.seedFromProgress(migrated,'2026-09-21');assert.equal(migrated.score.milestones.main['word|n'],3);
  migrated.score.week.events.x={day:'2026-09-21',scope:'main',key:'word|n',kind:'word',delta:15};
  const portable=core.portable(migrated);assert.equal(portable.score,undefined);
});

test('серверная схема закрывает таблицы и ограничивает ручную синхронизацию',()=>{
  const sql=fs.readFileSync(path.join(__dirname,'../supabase/migrations/202609210001_competition.sql'),'utf8');
  for(const table of ['competition_profiles','competition_friendships','competition_weekly_scores','competition_sync_usage','competition_retired_epochs'])assert.match(sql,new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(sql,/competition_sync_usage\.used<2/);
  assert.match(sql,/two_syncs_per_day/);
  assert.match(sql,/retired_score_epoch/);
  assert.match(sql,/unnest\(coalesce\(p_retired_epochs/);
  assert.match(sql,/grant execute on function[\s\S]+to authenticated/);
  assert.doesNotMatch(sql,/grant (select|insert|update|delete|all) on[^;]+to (anon|authenticated)/i);
});
