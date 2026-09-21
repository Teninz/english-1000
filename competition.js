// Недельный рейтинг друзей. Учебные данные не покидают устройство — публикуется только сумма баллов.
const competitionConfigured=()=>!!(COMPETITION_CONFIG?.url&&COMPETITION_CONFIG?.publishableKey);
const competitionSnapshot=()=>ScoreCore.publicSnapshot(S.score,today());
function competitionHomeCardHtml(){
  const score=competitionSnapshot(),friends=S.score.sync.friends.filter(f=>!f.incoming),all=[score.points,...friends.map(f=>f.points)].sort((a,b)=>b-a),place=all.indexOf(score.points)+1;
  return `<section class="card score-entry" id="competitionEntry"><div class="row"><span class="score-orb">${score.points}</span><div class="grow"><div class="eyebrow">Рейтинг недели</div><h2 style="font-size:20px;margin:3px 0 5px">${friends.length?`${place}-е место среди друзей`:"Начни соревнование"}</h2><p class="small muted">${score.activeDays}/4 активных дня · ${S.score.sync.lastSuccessAt?`обновлено ${competitionTime(S.score.sync.lastSuccessAt)}`:"баллы хранятся на устройстве"}</p></div><span aria-hidden="true">›</span></div></section>`;
}
function wireCompetitionHomeCard(){const b=$("#competitionEntry");if(b)b.onclick=()=>go("competition");}
function competitionTime(value){try{return new Date(value).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}catch(e){return "ранее";}}
const competitionUtcDay=()=>new Date().toISOString().slice(0,10);
function competitionFriendRows(score){
  const accepted=S.score.sync.friends.filter(f=>!f.incoming),rows=[{id:"me",nickname:S.score.profile.nickname||"Я",points:score.points,updatedAt:S.score.sync.lastSuccessAt,me:true},...accepted].sort((a,b)=>b.points-a.points||a.nickname.localeCompare(b.nickname,"ru"));
  if(!accepted.length)return `<div class="score-empty">Добавь друзей по коду — здесь появится недельная таблица.</div>`;
  return rows.map((f,i)=>`<div class="score-row ${f.me?"me":""}"><span class="score-place">${i+1}</span><span><b>${esc(f.nickname)}${f.me?" · вы":""}</b><span class="small muted">${f.updatedAt?competitionTime(f.updatedAt):"ещё не обновлял"}</span></span><span class="score-row-tail"><span class="points">${f.points}</span>${f.me?"":`<button class="icon-btn score-remove" data-score-remove="${esc(f.id)}" aria-label="Удалить ${esc(f.nickname)}">×</button>`}</span></div>`).join("");
}
function renderCompetition(){
  const score=competitionSnapshot(),day=score.days?.[today()]||{points:0},remaining=Math.max(0,2-(S.score.sync.quotaDay===competitionUtcDay()?S.score.sync.quotaUsed:0)),incoming=S.score.sync.friends.filter(f=>f.incoming);
  view().innerHTML=`<div class="row between"><button class="btn ghost small" id="scoreBack">‹ Сегодня</button><button class="btn ghost small" id="scoreProfile">${S.score.profile.nickname?esc(S.score.profile.nickname):"Создать профиль"}</button></div>
    <section class="card score-hero"><div class="eyebrow">Эта неделя · ${score.weekId}</div><div class="score-points">${score.points} <small>баллов</small></div><div class="score-meta"><span class="chip accent">сегодня ${day.points||0}/${ScoreCore.DAILY_CAP}</span><span class="chip ${score.activeDays>=4?"good":""}">${score.activeDays}/4 активных дня</span>${score.weekBonus?`<span class="chip good">ритм +${score.weekBonus}</span>`:""}</div></section>
    ${S.score.sync.pendingReset?`<div class="note">Обнуление баллов ещё не опубликовано. Нажми «Обновить».</div>`:""}
    <div class="score-sync"><button class="btn block huge" id="scoreSync">Обновить рейтинг</button><p class="small muted" style="text-align:center">${competitionConfigured()?`Осталось обновлений сегодня: ${remaining} из 2`:`Supabase ещё не подключён. Локальные баллы уже считаются.`}</p></div>
    ${incoming.length?`<section class="card"><div class="eyebrow" style="margin-bottom:8px">Заявки в друзья</div>${incoming.map(f=>`<div class="score-row"><span>👋</span><span><b>${esc(f.nickname)}</b><span class="small muted">хочет соревноваться</span></span><span class="score-request-actions"><button class="btn small" data-score-accept="${esc(f.id)}">Принять</button><button class="btn ghost small" data-score-remove="${esc(f.id)}">Отклонить</button></span></div>`).join("")}</section>`:""}
    <section class="card"><div class="row between"><div><div class="eyebrow">Друзья</div><h2 style="font-size:18px;margin-top:3px">Таблица недели</h2></div><button class="btn ghost small" id="scoreAdd">Добавить</button></div><div class="score-list">${competitionFriendRows(score)}</div></section>
    <section class="card"><div class="row between"><div><div class="eyebrow">Личный код</div><div class="score-code">${S.score.profile.inviteCode||"— — — —"}</div></div><button class="btn secondary small" id="scoreCopy" ${S.score.profile.inviteCode?"":"disabled"}>Копировать</button></div><p class="small muted">Передай код знакомому. Учебные слова и ответы ему недоступны.</p></section>
    ${!competitionConfigured()?`<div class="note">Для друзей нужно указать Project URL и Publishable key в competition-config.js. Secret key в приложение не добавляется.</div>`:""}
    <section class="card"><div class="eyebrow">Как начисляются баллы</div><div class="score-rule"><span class="n">+5</span><span><b>Новая интервальная ячейка</b><span class="small muted">Только первый самостоятельный ответ в плановый день.</span></span></div><div class="score-rule"><span class="n">+10</span><span><b>Статус «знаю»</b><span class="small muted">Разовая надбавка при переходе в третью ячейку.</span></span></div><div class="score-rule"><span class="n">+20</span><span><b>Статус «закреплено»</b><span class="small muted">Разовая надбавка при достижении шестой ячейки.</span></span></div><div class="score-rule"><span class="n">+25</span><span><b>Четыре учебных дня</b><span class="small muted">Недельный бонус за регулярность.</span></span></div></section>`;
  $("#scoreBack").onclick=()=>go("home");$("#scoreProfile").onclick=competitionProfileSheet;$("#scoreAdd").onclick=competitionAddSheet;$("#scoreSync").onclick=competitionSyncClick;$("#scoreCopy").onclick=competitionCopyCode;
  document.querySelectorAll("[data-score-accept]").forEach(b=>b.onclick=()=>competitionAccept(b.dataset.scoreAccept));
  document.querySelectorAll("[data-score-remove]").forEach(b=>b.onclick=()=>competitionRemove(b.dataset.scoreRemove));
}
function competitionProfileSheet(){
  sheet(`<div class="row between"><h2>Профиль рейтинга</h2><button class="icon-btn" data-close>${ICONS.close}</button></div><label class="small">Псевдоним<input class="type-in" id="scoreNickname" maxlength="30" value="${esc(S.score.profile.nickname)}" placeholder="Например, Юрий"></label><p class="small muted">Псевдоним и баллы видят только подтверждённые друзья.</p><button class="btn block" id="scoreProfileSave">Сохранить</button>${S.score.profile.userId?`<button class="btn ghost block" id="scoreProfileDelete" style="color:var(--bad)">Удалить профиль рейтинга</button>`:""}`);
  $("#scoreProfileSave").onclick=()=>{const name=$("#scoreNickname").value.trim();if(name.length<2){toast("Псевдоним должен быть не короче двух символов");return;}S.score.profile.nickname=name;save();closeSheet();renderCompetition();};
  if($("#scoreProfileDelete"))$("#scoreProfileDelete").onclick=competitionDeleteProfilePrompt;
}
function competitionAddSheet(){
  if(!S.score.profile.nickname){competitionProfileSheet();return;}
  sheet(`<div class="row between"><h2>Добавить друга</h2><button class="icon-btn" data-close>${ICONS.close}</button></div><label class="small">Код друга<input class="type-in" id="scoreFriendCode" maxlength="24" placeholder="Например, 7F3K9Q2A"></label><p class="small muted">Заявка отправится сразу. Друг должен принять её у себя.</p><button class="btn block" id="scoreFriendSend" ${competitionConfigured()?"":"disabled"}>Отправить заявку</button>`);
  $("#scoreFriendSend").onclick=async()=>{const code=$("#scoreFriendCode").value.trim().toUpperCase();if(code.length<6){toast("Проверь код друга");return;}const btn=$("#scoreFriendSend");btn.disabled=true;try{await competitionRegister();await competitionRpc("competition_add_friend",{p_code:code});closeSheet();toast("Заявка отправлена");}catch(e){btn.disabled=false;toast(competitionError(e));}};
}
async function competitionCopyCode(){try{await navigator.clipboard.writeText(S.score.profile.inviteCode);toast("Код скопирован");}catch(e){toast("Не удалось скопировать код");}}
function competitionError(error){const m=String(error?.message||error);if(/rate|limit|quota|two_syncs/i.test(m))return "Сегодня уже использованы два обновления";if(/friend_not_found/i.test(m))return "Пользователь с таким кодом не найден";if(/same_user/i.test(m))return "Нельзя добавить самого себя";if(/device/i.test(m))return "Рейтинг привязан к другому устройству";if(/retired_score_epoch/i.test(m))return "Эта старая копия баллов уже была сброшена";return "Не удалось связаться с рейтингом";}
async function competitionFetch(path,body,token){
  const base=COMPETITION_CONFIG.url.replace(/\/$/,""),r=await fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json","apikey":COMPETITION_CONFIG.publishableKey,...(token?{"Authorization":"Bearer "+token}:{})},body:JSON.stringify(body||{})});
  const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.message||data.error_description||data.error||`HTTP ${r.status}`);return data;
}
async function competitionAuth(){
  if(S.score.profile.accessToken)return S.score.profile.accessToken;
  const data=await competitionFetch("/auth/v1/signup",{data:{}},null),session=data.session||data;
  if(!session.access_token)throw Error("auth_failed");
  S.score.profile.userId=data.user?.id||session.user?.id||null;S.score.profile.accessToken=session.access_token;S.score.profile.refreshToken=session.refresh_token||null;save();return session.access_token;
}
async function competitionRpc(name,params,retry=true){
  const token=await competitionAuth();try{return await competitionFetch(`/rest/v1/rpc/${name}`,params,token);}catch(e){
    if(retry&&/jwt|token|401/i.test(String(e.message))&&S.score.profile.refreshToken){const data=await competitionFetch("/auth/v1/token?grant_type=refresh_token",{refresh_token:S.score.profile.refreshToken},null);S.score.profile.accessToken=data.access_token;S.score.profile.refreshToken=data.refresh_token||S.score.profile.refreshToken;save();return competitionRpc(name,params,false);}throw e;
  }
}
async function competitionRegister(){
  S.score.profile.deviceId=S.score.profile.deviceId||((typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}-${Math.random()}`);
  const p=await competitionRpc("competition_register",{p_nickname:S.score.profile.nickname,p_device_id:S.score.profile.deviceId||""});
  if(p?.invite_code)S.score.profile.inviteCode=p.invite_code;if(p?.id)S.score.profile.userId=p.id;save();return p;
}
async function competitionSyncClick(){
  if(!competitionConfigured()){toast("Сначала подключи проект Supabase");return;}if(!S.score.profile.nickname){competitionProfileSheet();return;}
  const btn=$("#scoreSync");btn.disabled=true;btn.textContent="Обновляю…";
  try{await competitionRegister();const snap=competitionSnapshot(),data=await competitionRpc("competition_sync",{p_week_id:snap.weekId,p_score_epoch:snap.epoch,p_retired_epochs:S.score.retiredEpochs,p_points:snap.points,p_device_id:S.score.profile.deviceId});
    S.score.sync.friends=[...(data.friends||[]).map(f=>({id:f.id,nickname:f.nickname,points:f.points||0,updatedAt:f.updated_at||null})),...(data.requests||[]).map(f=>({id:f.id,nickname:f.nickname,points:0,updatedAt:null,incoming:true}))];
    S.score.sync.lastSuccessAt=data.updated_at||new Date().toISOString();S.score.sync.lastPublishedPoints=snap.points;S.score.sync.pendingReset=false;S.score.sync.quotaDay=data.quota_day||competitionUtcDay();S.score.sync.quotaUsed=data.quota_used||Math.min(2,S.score.sync.quotaUsed+1);save();renderCompetition();toast("Рейтинг обновлён");
  }catch(e){btn.disabled=false;btn.textContent="Обновить рейтинг";toast(competitionError(e));}
}
async function competitionAccept(id){try{await competitionRegister();await competitionRpc("competition_accept_friend",{p_requester:id});S.score.sync.friends=S.score.sync.friends.filter(f=>f.id!==id);save();renderCompetition();toast("Друг добавлен");}catch(e){toast(competitionError(e));}}
async function competitionRemove(id){
  const friend=S.score.sync.friends.find(f=>f.id===id);if(!friend)return;
  const verb=friend.incoming?"Отклонить заявку":"Удалить друга";
  sheet(`<div class="row between"><h2>${verb}</h2><button class="icon-btn" data-close>${ICONS.close}</button></div><p>${friend.incoming?"Заявка":"Профиль"} <b>${esc(friend.nickname)}</b> исчезнет из рейтинга.</p><button class="btn danger block" id="scoreRemoveConfirm">${verb}</button>`);
  $("#scoreRemoveConfirm").onclick=async()=>{const btn=$("#scoreRemoveConfirm");btn.disabled=true;try{await competitionRegister();await competitionRpc("competition_remove_friend",{p_friend:id});S.score.sync.friends=S.score.sync.friends.filter(f=>f.id!==id);save();closeSheet();renderCompetition();toast(friend.incoming?"Заявка отклонена":"Друг удалён");}catch(e){btn.disabled=false;toast(competitionError(e));}};
}
function competitionDeleteProfilePrompt(){
  sheet(`<div class="row between"><h2>Удалить профиль рейтинга?</h2><button class="icon-btn" data-close>${ICONS.close}</button></div><p>Псевдоним, баллы и связи друзей будут удалены из Supabase. Учебный прогресс на устройстве сохранится.</p><button class="btn danger block" id="scoreDeleteConfirm">Удалить профиль</button>`);
  $("#scoreDeleteConfirm").onclick=async()=>{const btn=$("#scoreDeleteConfirm");btn.disabled=true;try{await competitionRpc("competition_delete_profile",{});S.score.profile={nickname:"",inviteCode:"",userId:null,accessToken:null,refreshToken:null,deviceId:null};S.score.sync.friends=[];S.score.sync.lastSuccessAt=null;S.score.sync.lastPublishedPoints=0;S.score.sync.quotaDay=null;S.score.sync.quotaUsed=0;save();closeSheet();renderCompetition();toast("Профиль рейтинга удалён");}catch(e){btn.disabled=false;toast(competitionError(e));}};
}
