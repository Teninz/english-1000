// Импорт заменяет состояние только после проверки и успешной записи резервной копии.
let storageBlocked = false, storageErrorShown = false;
function storageWarning(message){
  let box=document.getElementById("storageWarning");
  if(!box){box=document.createElement("div");box.id="storageWarning";box.className="storage-warning";box.setAttribute("role","alert");document.body.prepend(box);}
  box.textContent=message;
}
function clearStorageWarning(){ document.getElementById("storageWarning")?.remove(); storageErrorShown=false; }
function load(){
  try {
    const raw=localStorage.getItem(KEY);
    S=raw ? LearningCore.validate(JSON.parse(raw)) : LearningCore.empty();
    storageBlocked=false;
  } catch(e) {
    S=LearningCore.empty(); storageBlocked=true;
    storageWarning("Не удалось прочитать прогресс. Исходные данные сохранены. Восстанови резервную копию в настройках; новые ответы пока не сохраняются.");
  }
}
function save(){
  if(storageBlocked)return false;
  try {localStorage.setItem(KEY,JSON.stringify(S));clearStorageWarning();return true;}
  catch(e){if(!storageErrorShown){storageWarning("Не удалось сохранить прогресс. Освободи место или сохрани резервную копию в настройках. Не закрывай приложение до сохранения.");storageErrorShown=true;}return false;}
}
function progressCode(){ return btoa(unescape(encodeURIComponent(JSON.stringify(LearningCore.portable(S))))); }
function parseProgress(text){
  const input=text.trim(); if(input.length>6000000)throw Error("Файл слишком большой");
  return JSON.parse(input.startsWith("{")?input:decodeURIComponent(escape(atob(input))));
}
function requestProgressImport(text){
  let candidate;
  try {candidate=LearningCore.prepareImport(parseProgress(text),S);} catch(e){toast("Не удалось прочитать копию: "+e.message);return;}
  confirmSheet("Загрузить прогресс?",`В копии ${Object.keys(candidate.w).length} начатых слов. Текущий прогресс будет сохранён для отмены. Голоса и ключи этого устройства останутся.`,"Загрузить",()=>{
    try {
      const previous=localStorage.getItem(KEY);
      localStorage.setItem(KEY+".before-import",previous || JSON.stringify(S));
      localStorage.setItem(KEY,JSON.stringify(candidate));
      endSession();S=candidate;storageBlocked=false;clearStorageWarning();
      applyTheme();applyScene();pickVoices();go("home");
      if(window.updateWidget)window.updateWidget(true);
      if(window.syncCompanion)window.syncCompanion();
      toast("Прогресс загружен. Предыдущая копия доступна в настройках.");
    }catch(e){storageWarning("Загрузка отменена: не удалось сохранить копию. Текущий прогресс не заменён.");}
  });
}
async function downloadProgress(){
  const json=JSON.stringify(LearningCore.portable(S),null,2), name=`ShadowFox-progress-${today()}.json`;
  try{
    if(window.shareProgressFile){await window.shareProgressFile(json,name);return;}
    const url=URL.createObjectURL(new Blob([json],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }catch(e){toast("Не удалось сохранить файл. Можно скопировать код.");}
}
function wireProgressStorage(){
  $("#exp").onclick=async()=>{try{const code=progressCode();$("#io").value=code;await navigator.clipboard.writeText(code);toast("Код без API-ключей скопирован");}catch(e){$("#io").select();toast("Скопируй код из поля");}};
  $("#imp").onclick=()=>requestProgressImport($("#io").value);
  $("#backupFile").onclick=downloadProgress;
  $("#importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>6000000){toast("Файл слишком большой");return;}try{requestProgressImport(await f.text());}catch(err){toast("Не удалось прочитать файл");}};
  $("#undoImport").onclick=()=>{try{const raw=localStorage.getItem(KEY+".before-import");if(raw)requestProgressImport(raw);else toast("Предыдущей копии пока нет");}catch(e){toast("Копия недоступна");}};
}
