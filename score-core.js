// Локальная балльная система. Сервер получает только итог текущей недели.
const ScoreCore = (() => {
  const DAILY_CAP = 200, WORD_STEP = 5, KNOW_BONUS = 10, MASTER_BONUS = 20;
  const DAILY_BONUS = 10, WEEK_BONUS = 25, EXAM_BONUS = 50, VERIFY_BONUS = 5;
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  const clone = value => JSON.parse(JSON.stringify(value));
  const validDay = day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day);
  function epoch(now = Date.now(), rng = Math.random){
    if(typeof crypto!=="undefined"&&crypto.randomUUID)return crypto.randomUUID();
    return `${now.toString(36)}-${Math.floor(rng()*Number.MAX_SAFE_INTEGER).toString(36)}`;
  }
  function weekId(day){
    const d=new Date(day+"T12:00:00Z");
    d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
    const year=d.getUTCFullYear(),start=new Date(Date.UTC(year,0,1));
    const week=Math.ceil((((d-start)/86400000)+1)/7);
    return `${year}-W${String(week).padStart(2,"0")}`;
  }
  function empty(){
    return {version:1,epoch:null,retiredEpochs:[],week:{id:null,events:{}},archive:{},milestones:{main:{},thematic:{},verified:{},exams:{}},profile:{nickname:"",inviteCode:"",userId:null,accessToken:null,refreshToken:null,deviceId:null},sync:{lastSuccessAt:null,lastPublishedPoints:0,pendingReset:false,friends:[],quotaDay:null,quotaUsed:0}};
  }
  function ensure(score,day){
    score=score||empty();
    if(!score.epoch)score.epoch=epoch();
    if(day){
      const id=weekId(day);
      if(score.week.id&&score.week.id!==id){
        score.archive[score.week.id]=summary(score.week.events).points;
        const old=Object.keys(score.archive).sort();while(old.length>52)delete score.archive[old.shift()];
        score.week={id,events:{}};
      }else if(!score.week.id)score.week.id=id;
    }
    return score;
  }
  function summary(events){
    const days={};
    for(const e of Object.values(events||{})){
      const d=days[e.day]||(days[e.day]={raw:0,wordCount:0});
      d.raw+=e.delta;if(e.kind==="word"||e.kind==="verify")d.wordCount++;
    }
    let points=0,dailyBonus=0;
    for(const d of Object.values(days)){
      const bonus=d.wordCount>=10?DAILY_BONUS:0;dailyBonus+=bonus;d.points=Math.min(DAILY_CAP,d.raw+bonus);points+=d.points;
    }
    const activeDays=Object.keys(days).filter(day=>days[day].raw>0).length,weekBonus=activeDays>=4?WEEK_BONUS:0;
    return {points:points+weekBonus,activeDays,dailyBonus,weekBonus,days};
  }
  const current = (score,day) => {ensure(score,day);return summary(score.week.events);};
  function addEvent(score,id,event){
    ensure(score,event.day);if(own(score.week.events,id))return 0;
    const before=summary(score.week.events).points;
    score.week.events[id]=event;
    return summary(score.week.events).points-before;
  }
  function milestoneBucket(score,scope){
    if(scope==="main")return score.milestones.main;
    if(!scope.startsWith("thematic:"))throw Error("Некорректная область баллов");
    const route=scope.slice(9);return score.milestones.thematic[route]||(score.milestones.thematic[route]={});
  }
  function seedWord(score,scope,key,box){
    const bucket=milestoneBucket(score,scope),prev=own(bucket,key)?bucket[key]:0;
    bucket[key]=Math.max(prev,box||0);return bucket[key];
  }
  function seedFromProgress(state,day){
    state.score=ensure(state.score,day);
    for(const [key,r] of Object.entries(state.w||{}))seedWord(state.score,"main",key,r.box);
    for(const [route,topic] of Object.entries(state.thematic?.topics||{})){
      for(const [key,r] of Object.entries(topic.words||{}))seedWord(state.score,`thematic:${route}`,key,r.box);
      if(topic.exam?.passedAt)state.score.milestones.exams[route]=1;
    }
    return state.score;
  }
  function markKnown(score,scope,key,box=5,day){ensure(score,day);seedWord(score,scope,key,box);}
  function awardWord(score,{scope,key,before,after,day,assisted=false}){
    ensure(score,day);if(!after||assisted)return 0;
    const bucket=milestoneBucket(score,scope),paid=own(bucket,key)?bucket[key]:0;
    // Слова из стартовой проверки уже находятся в шестой ячейке: оплачивается только первая самостоятельная проверка.
    const verifiedId=`${scope}:${key}:verified`;
    if(before?.known===1&&!after.known&&after.box===6&&paid>=5&&!own(score.milestones.verified,verifiedId)){
      bucket[key]=Math.max(paid,after.box);
      score.milestones.verified[verifiedId]=1;
      return addEvent(score,verifiedId,{day,scope,key,kind:"verify",delta:VERIFY_BONUS});
    }
    if(after.box<=paid)return 0;
    let delta=0;for(let box=paid+1;box<=after.box;box++){delta+=WORD_STEP;if(box===3)delta+=KNOW_BONUS;if(box===6)delta+=MASTER_BONUS;}
    bucket[key]=after.box;
    return addEvent(score,`${scope}:${key}:box:${after.box}`,{day,scope,key,kind:"word",delta});
  }
  function awardExam(score,route,day){
    ensure(score,day);if(score.milestones.exams[route])return 0;score.milestones.exams[route]=1;
    return addEvent(score,`thematic:${route}:exam`,{day,scope:`thematic:${route}`,key:"exam",kind:"exam",delta:EXAM_BONUS});
  }
  function rotate(score){if(score.epoch&&!score.retiredEpochs.includes(score.epoch)){score.retiredEpochs.push(score.epoch);if(score.retiredEpochs.length>500)score.retiredEpochs.shift();}score.epoch=epoch();score.sync.pendingReset=true;}
  function resetWords(score,scope,keys,day){
    ensure(score,day);const set=new Set(keys),bucket=milestoneBucket(score,scope);
    for(const key of set)delete bucket[key];
    for(const id of Object.keys(score.milestones.verified))if(id.startsWith(scope+":")&&set.has(id.slice(scope.length+1,-9)))delete score.milestones.verified[id];
    for(const [id,e] of Object.entries(score.week.events))if(e.scope===scope&&set.has(e.key))delete score.week.events[id];
    rotate(score);return current(score,day);
  }
  function resetScope(score,scope,day){
    ensure(score,day);
    if(scope==="main")score.milestones.main={};
    else if(scope.startsWith("thematic:")){const route=scope.slice(9);delete score.milestones.thematic[route];delete score.milestones.exams[route];}
    for(const id of Object.keys(score.milestones.verified))if(id.startsWith(scope+":"))delete score.milestones.verified[id];
    for(const [id,e] of Object.entries(score.week.events))if(e.scope===scope)delete score.week.events[id];
    rotate(score);return current(score,day);
  }
  function resetAll(score,day){
    const keep=score?{profile:clone(score.profile),friends:clone(score.sync.friends),lastPublishedPoints:score.sync.lastPublishedPoints,retiredEpochs:clone(score.retiredEpochs||[]),epoch:score.epoch}:null,next=empty();
    if(keep?.epoch&&!keep.retiredEpochs.includes(keep.epoch))keep.retiredEpochs.push(keep.epoch);
    next.retiredEpochs=keep?keep.retiredEpochs.slice(-500):[];next.epoch=epoch();next.week.id=weekId(day);next.sync.pendingReset=true;
    if(keep){next.profile=keep.profile;next.sync.friends=keep.friends;next.sync.lastPublishedPoints=keep.lastPublishedPoints;}
    return next;
  }
  function publicSnapshot(score,day){
    const result=current(score,day);return {weekId:score.week.id,points:result.points,activeDays:result.activeDays,dailyBonus:result.dailyBonus,weekBonus:result.weekBonus,days:result.days,epoch:score.epoch};
  }
  return {DAILY_CAP,WORD_STEP,KNOW_BONUS,MASTER_BONUS,DAILY_BONUS,WEEK_BONUS,EXAM_BONUS,VERIFY_BONUS,weekId,empty,ensure,current,summary,seedWord,seedFromProgress,markKnown,awardWord,awardExam,resetWords,resetScope,resetAll,publicSnapshot};
})();
if(typeof module!=="undefined")module.exports=ScoreCore;
