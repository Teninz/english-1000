// Движок озвучки ShadowFox Eng: системные голоса, офлайн-Piper, онлайн-API (Google Cloud, ElevenLabs).
// Всё синтезированное кэшируется, поэтому слово, озвученное один раз онлайн, дальше играет без сети.
// Ожидает глобальные S, save, toast, esc, plural из index.html.

const PIPER_VOICES = {
  en: [
    ["en_US-amy-medium","Amy · US, женский"],["en_US-hfc_female-medium","HFC · US, женский"],["en_US-kristin-medium","Kristin · US, женский"],
    ["en_US-ryan-medium","Ryan · US, мужской"],["en_US-joe-medium","Joe · US, мужской"],["en_US-lessac-medium","Lessac · US, нейтральный"],
    ["en_GB-jenny_dioco-medium","Jenny · UK, женский"],["en_GB-alba-medium","Alba · UK, женский"],["en_GB-cori-medium","Cori · UK, женский"],
    ["en_GB-alan-medium","Alan · UK, мужской"],["en_GB-northern_english_male-medium","Northern · UK, мужской"],
  ],
  ru: [["ru_RU-irina-medium","Ирина"],["ru_RU-dmitri-medium","Дмитрий"],["ru_RU-denis-medium","Денис"],["ru_RU-ruslan-medium","Руслан"]],
};
const GOOGLE_VOICES = {
  en: [["en-US-Neural2-C","Neural2 C · US, женский"],["en-US-Neural2-F","Neural2 F · US, женский"],["en-US-Neural2-D","Neural2 D · US, мужской"],["en-US-Neural2-J","Neural2 J · US, мужской"],
       ["en-GB-Neural2-A","Neural2 A · UK, женский"],["en-GB-Neural2-B","Neural2 B · UK, мужской"],["en-AU-Neural2-A","Neural2 A · AU, женский"],["en-US-Wavenet-D","Wavenet D · US, мужской"]],
  ru: [["ru-RU-Wavenet-A","Wavenet A · женский"],["ru-RU-Wavenet-C","Wavenet C · женский"],["ru-RU-Wavenet-B","Wavenet B · мужской"],["ru-RU-Wavenet-D","Wavenet D · мужской"]],
};
const ELEVEN_DEFAULT = [["21m00Tcm4TlvDq8ikWAM","Rachel"],["EXAVITQu4vr4xnSDxMaL","Sarah"],["pNInz6obpgDQGcFmaJgB","Adam"],["TX3LPaxmHKxFdv7VOQHJ","Liam"],["XB0fDUnXU5powFXDhCwa","Charlotte"],["onwK4e9ZLuTAKqWW03F9","Daniel"]];

const TTS = {
  piperLib: null, sessions: {}, current: null, cacheP: null, piperStored: null, piperBusy: {},
  cfg(lang){ const t = (S.set.tts = S.set.tts || {}); const k = lang.startsWith("ru") ? "ru" : "en"; return (t[k] = t[k] || {engine:"system"}); },
  keys(){ return (S.set.ttsKeys = S.set.ttsKeys || {}); },
  async cache(){ if(!("caches" in window)) return null; if(!this.cacheP) this.cacheP = caches.open("shadowfox-tts-v2").catch(()=>null); return this.cacheP; },
  cacheKey(engine, voice, text){ return "/tts-cache/" + encodeURIComponent(engine+"|"+voice+"|"+text); },
  async cached(engine, voice, text){ const c = await this.cache(); if(!c) return null; const r = await c.match(this.cacheKey(engine,voice,text)); return r ? r.blob() : null; },
  async store(engine, voice, text, blob){ const c = await this.cache(); if(c) c.put(this.cacheKey(engine,voice,text), new Response(blob)).catch(()=>{}); },
  stop(){ if("speechSynthesis" in window) speechSynthesis.cancel(); if(this.current){ try{ this.current.pause(); }catch(e){} this.current = null; } },
  // главный вход: озвучить и дождаться конца
  async speak(text, lang = "en-US"){
    if(!text) return; this.stop();
    const cfg = this.cfg(lang);
    try {
      if(cfg.engine === "piper" && cfg.voice) return await this.play(await this.piperBlob(cfg.voice, text), lang);
      if(cfg.engine === "google" && cfg.voice) return await this.play(await this.googleBlob(cfg.voice, text, lang), lang);
      if(cfg.engine === "eleven" && cfg.voice) return await this.play(await this.elevenBlob(cfg.voice, text), lang);
    } catch(e){
      // офлайн, нет ключа, лимит — один раз предупреждаем и уходим на системный голос
      if(!this.warned){ this.warned = true; toast("Голос недоступен (" + (e.message||"ошибка") + "). Читает системный."); setTimeout(()=>this.warned=false, 8000); }
    }
    return this.system(text, lang);
  },
  play(blob, lang){
    return new Promise(res => {
      const a = new Audio(URL.createObjectURL(blob)); a.playbackRate = Math.min(2, Math.max(.5, (S.set.rate||1)));
      let done = false; const fin = () => { if(done) return; done = true; URL.revokeObjectURL(a.src); if(this.current===a) this.current = null; res(); };
      a.onended = fin; a.onerror = fin; a.onpause = () => { if(a.currentTime < a.duration - 0.05) fin(); };
      this.current = a; a.play().catch(fin);
    });
  },
  system(text, lang){
    return new Promise(res => {
      if(!("speechSynthesis" in window)){ res(); return; }
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = (S.set.rate||1) * (lang.startsWith("ru") ? 1 : 0.88);
      const v = lang.startsWith("ru") ? ruVoice : enVoice; if(v) u.voice = v;
      let done = false; const fin = () => { if(!done){ done = true; res(); } };
      u.onend = fin; u.onerror = fin; speechSynthesis.speak(u);
      setTimeout(fin, Math.max(2500, text.length * 130)); // страховка: в Chrome onend иногда не приходит
    });
  },
  /* ---- Piper: офлайн, модель в браузере ---- */
  async piper(){ if(!this.piperLib) this.piperLib = await import("./lib/piper.js"); return this.piperLib; },
  wasmPaths(){ const base = new URL("./lib/", location.href).href; return { onnxWasm: base + "ort/", piperData: base + "piper_phonemize.data", piperWasm: base + "piper_phonemize.wasm" }; },
  async piperList(){ const lib = await this.piper(); this.piperStored = await lib.stored().catch(()=>[]); return this.piperStored; },
  async piperDownload(id, onProgress){
    const lib = await this.piper(); this.piperBusy[id] = 0;
    await lib.download(id, p => { this.piperBusy[id] = p.total ? p.loaded / p.total : 0; onProgress && onProgress(this.piperBusy[id]); });
    delete this.piperBusy[id]; await this.piperList();
  },
  async piperRemove(id){ const lib = await this.piper(); await lib.remove(id); delete this.sessions[id]; await this.piperList(); },
  async piperBlob(id, text){
    const hit = await this.cached("piper", id, text); if(hit) return hit;
    const lib = await this.piper();
    // библиотека держит сессию-синглтон и на второй вызов вернула бы старую модель — сбрасываем перед созданием новой
    if(!this.sessions[id]){ lib.TtsSession._instance = null; this.sessions[id] = lib.TtsSession.create({ voiceId: id, wasmPaths: this.wasmPaths() }).catch(e => { delete this.sessions[id]; throw e; }); }
    const s = await this.sessions[id]; const blob = await s.predict(text);
    this.store("piper", id, text, blob); return blob;
  },
  /* ---- Google Cloud Text-to-Speech ---- */
  async googleBlob(voice, text, lang){
    const key = this.keys().google; if(!key) throw new Error("нет ключа Google");
    const hit = await this.cached("google", voice, text); if(hit) return hit;
    const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + encodeURIComponent(key), { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ input:{text}, voice:{ languageCode: voice.slice(0,5), name: voice }, audioConfig:{ audioEncoding:"MP3", speakingRate: lang.startsWith("ru") ? 1 : 0.92 } }) });
    if(!r.ok){ const j = await r.json().catch(()=>({})); throw new Error(j.error?.message || ("Google " + r.status)); }
    const j = await r.json(); const bin = atob(j.audioContent); const u8 = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
    const blob = new Blob([u8], {type:"audio/mpeg"}); this.store("google", voice, text, blob); return blob;
  },
  async googleVoices(lang){
    const key = this.keys().google; if(!key) throw new Error("нет ключа");
    const r = await fetch("https://texttospeech.googleapis.com/v1/voices?languageCode=" + lang + "&key=" + encodeURIComponent(key)); if(!r.ok) throw new Error("Google " + r.status);
    const j = await r.json(); return (j.voices||[]).map(v => [v.name, v.name.replace(/^[a-z]{2}-[A-Z]{2}-/,"") + " · " + v.languageCodes[0].slice(3) + ", " + (v.ssmlGender==="FEMALE"?"женский":"мужской")]);
  },
  /* ---- ElevenLabs ---- */
  async elevenBlob(voice, text){
    const key = this.keys().eleven; if(!key) throw new Error("нет ключа ElevenLabs");
    const hit = await this.cached("eleven", voice, text); if(hit) return hit;
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voice + "?output_format=mp3_44100_64", { method:"POST", headers:{"Content-Type":"application/json","xi-api-key":key},
      body: JSON.stringify({ text, model_id:"eleven_multilingual_v2" }) });
    if(!r.ok) throw new Error("ElevenLabs " + r.status);
    const blob = await r.blob(); this.store("eleven", voice, text, blob); return blob;
  },
  async elevenVoices(){
    const key = this.keys().eleven; if(!key) throw new Error("нет ключа");
    const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers:{"xi-api-key":key} }); if(!r.ok) throw new Error("ElevenLabs " + r.status);
    const j = await r.json(); return (j.voices||[]).map(v => [v.voice_id, v.name + (v.labels?.gender ? " · " + (v.labels.gender==="female"?"женский":"мужской") : "")]);
  },
};

/* ---------- панель «Голоса» в настройках ---------- */
// Категории источников голосов: что нужно (ключ / скачивание) и где работает (офлайн / интернет)
const ENGINES = {
  system: { title:"Из системы телефона", tags:[["free","без ключа"],["off","офлайн"]], desc:"Голоса, установленные в Android или iPhone. Бесплатно; новые ставятся в настройках телефона." },
  piper:  { title:"Встроенные нейросетевые", tags:[["free","без ключа"],["dl","скачать 63 МБ"],["off","офлайн"]], desc:"Голоса Piper внутри приложения. Один раз скачал — работает в самолёте." },
  google: { title:"Google Cloud", tags:[["key","нужен ключ"],["net","интернет"],["card","карта"]], desc:"Лучшие голоса Neural2 и Wavenet. Бесплатно 1 млн символов в месяц, но для ключа нужен аккаунт Google Cloud с привязанной картой." },
  eleven: { title:"ElevenLabs", tags:[["key","нужен ключ"],["net","интернет"]], desc:"Самые естественные голоса. Бесплатно 10 тыс. символов в месяц, без карты — только регистрация с капчей." },
};
const TAG_CLASS = { free:"good", off:"good", dl:"accent", key:"warn", net:"", card:"warn" };
const tagsHtml = tags => tags.map(([k,t]) => `<span class="chip ${TAG_CLASS[k]||""}" style="font-size:11px;padding:3px 8px">${t}</span>`).join("");
function voicesPanel(){
  return `<div class="row between"><span>Голоса</span><button class="btn ghost small" id="voiceGuide">Как подключить</button></div>
    ${["en","ru"].map(l => voiceBlock(l)).join("")}
    <div class="row"><span class="small grow">Скорость речи <b id="rateLab" class="num">${Math.round((S.set.rate||1)*100)}%</b></span><input type="range" id="rate" min="0.6" max="1.4" step="0.05" value="${S.set.rate||1}" style="width:160px;accent-color:var(--accent)"></div>
    <div class="row between"><span class="small muted">Озвученные слова кэшируются и играют без сети</span><button class="btn ghost" id="ttsFlush" style="font-size:13px;white-space:nowrap">Очистить кэш</button></div>`;
}
function voiceBlock(l){
  const cfg = TTS.cfg(l==="en"?"en-US":"ru-RU"); const label = l==="en" ? "Английский" : "Русский";
  const cats = Object.entries(ENGINES).map(([k,e]) => { const on = cfg.engine===k; let body = "";
    if(on){ body = k==="system" ? voiceRow(l, l==="en" ? enVoice : ruVoice) : k==="piper" ? piperRows(l, cfg) : onlineRows(l, cfg); }
    return `<div class="vcat ${on?"on":""}"><button class="vcat-h" data-e="${k}"><span class="grow"><b>${e.title}</b><span class="row" style="gap:5px;flex-wrap:wrap;margin-top:4px">${tagsHtml(e.tags)}</span></span><i class="dot ${on?"s3":""}"></i></button>
      ${on?`<div class="vcat-b"><p class="small muted" style="margin-bottom:8px">${e.desc}</p>${body}</div>`:""}</div>`; }).join("");
  return `<div class="vblock" data-l="${l}"><b class="small" style="display:block;margin-bottom:8px">${label}</b><div class="vcats">${cats}</div></div>`;
}
function voiceRow(lang, cur){
  const vs = voicesFor(lang); if(!vs.length) return `<div class="small muted">Нет системных голосов для этого языка — поставь голосовые данные в настройках телефона (см. «Как подключить») или выбери встроенные.</div>`;
  const opts = vs.map(v => `<option value="${esc(v.voiceURI)}" ${cur && v.voiceURI===cur.voiceURI?"selected":""}>${esc(v.name.replace(/^(Microsoft|Google) /,""))}${/^en/.test(lang)?" · "+v.lang.replace("_","-"):""}${v.localService?"":" · онлайн"}</option>`).join("");
  return `<div class="row"><select class="sel grow" id="v_${lang}" style="padding:9px 12px">${opts}</select>${testBtn(lang)}</div>`;
}
const testBtn = l => `<button class="speak vtest" data-l="${l}" style="width:40px;height:40px;flex:none" aria-label="Прослушать">${ICONS.sound.replace("<svg","<svg width=20 height=20")}</button>`;
function piperRows(l, cfg){
  const stored = TTS.piperStored || [];
  const rows = PIPER_VOICES[l].map(([id,name]) => { const has = stored.includes(id), busy = TTS.piperBusy[id];
    return `<div class="prow ${cfg.voice===id?"on":""}" data-id="${id}">
      <button class="pname" data-pick="${id}" ${has?"":"disabled"}><i class="dot ${has?"s3":""}"></i><span class="grow">${esc(name)}</span></button>
      ${busy!==undefined ? `<span class="small muted num">${Math.round(busy*100)}%</span>` : has ? `<button class="btn ghost small" data-del="${id}" style="color:var(--bad)">Удалить</button>` : `<button class="btn ghost small" data-dl="${id}">Скачать</button>`}
    </div>`; }).join("");
  return `<div class="plist">${rows}</div>
    <div class="row between" style="margin-top:8px"><span class="small muted">${stored.length ? "Отмеченный голос играет без интернета" : "Скачай хотя бы один голос (лучше по Wi-Fi)"}</span>${cfg.voice?testBtn(l):""}</div>`;
}
function onlineRows(l, cfg){
  const g = cfg.engine==="google"; const keys = TTS.keys(); const key = g ? keys.google : keys.eleven;
  const list = g ? (keys.googleList?.[l] || GOOGLE_VOICES[l]) : (keys.elevenList || ELEVEN_DEFAULT);
  const opts = list.map(([id,name]) => `<option value="${esc(id)}" ${cfg.voice===id?"selected":""}>${esc(name)}</option>`).join("");
  if(!key) return `<div class="note" style="display:flex;align-items:center;gap:10px"><span class="grow">Ключ ещё не подключён</span><button class="btn small" data-guide="${cfg.engine}">Подключить</button></div>`;
  return `<div class="row"><select class="sel grow" id="ov_${l}" style="padding:9px 12px">${opts}</select><button class="btn ghost small" data-fetch="${cfg.engine}" data-l="${l}" title="Загрузить полный список голосов">Список</button>${testBtn(l)}</div>
    <div class="row between" style="margin-top:6px"><span class="small muted">Ключ подключён · ${key.slice(0,6)}…</span><button class="btn ghost small" data-guide="${cfg.engine}">Изменить ключ</button></div>`;
}
function wireVoicesPanel(rerender){
  document.querySelectorAll(".vblock").forEach(blk => {
    const l = blk.dataset.l, lang = l==="en" ? "en-US" : "ru-RU", cfg = TTS.cfg(lang);
    blk.querySelectorAll("[data-e]").forEach(b => b.onclick = async () => { if(cfg.engine===b.dataset.e) return; cfg.engine = b.dataset.e;
      if(cfg.engine==="piper"){ await TTS.piperList().catch(()=>{}); if(!cfg.voice || !PIPER_VOICES[l].some(v=>v[0]===cfg.voice)) cfg.voice = (TTS.piperStored||[]).find(id => PIPER_VOICES[l].some(v=>v[0]===id)) || null; }
      if(cfg.engine==="google" || cfg.engine==="eleven"){ const list = cfg.engine==="google" ? GOOGLE_VOICES[l] : ELEVEN_DEFAULT; if(!list.some(v=>v[0]===cfg.voice)) cfg.voice = list[0][0]; }
      save(); rerender(); });
    const sel = blk.querySelector("#v_"+l); if(sel) sel.onchange = () => { S.set[l+"Voice"] = sel.value || null; save(); pickVoices(); };
    const osel = blk.querySelector("#ov_"+l); if(osel) osel.onchange = () => { cfg.voice = osel.value; save(); };
    blk.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { cfg.voice = b.dataset.pick; save(); rerender(); });
    blk.querySelectorAll("[data-dl]").forEach(b => b.onclick = async () => { const id = b.dataset.dl; b.textContent = "0%"; b.disabled = true;
      try { await TTS.piperDownload(id, p => { const el = blk.querySelector(`[data-dl="${id}"]`); if(el) el.textContent = Math.round(p*100)+"%"; }); if(!cfg.voice) cfg.voice = id; save(); toast("Голос скачан"); }
      catch(e){ toast("Не скачалось: " + (e.message||"проверь интернет")); delete TTS.piperBusy[id]; }
      rerender(); });
    blk.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { await TTS.piperRemove(b.dataset.del); if(cfg.voice===b.dataset.del) cfg.voice = null; save(); rerender(); });
    blk.querySelectorAll("[data-guide]").forEach(b => b.onclick = () => guideSheet(b.dataset.guide, rerender));
    blk.querySelectorAll("[data-fetch]").forEach(b => b.onclick = async () => { b.textContent = "…"; try { const keys = TTS.keys();
        if(b.dataset.fetch==="google"){ keys.googleList = keys.googleList || {}; keys.googleList[l] = await TTS.googleVoices(l==="en"?"en":"ru"); } else keys.elevenList = await TTS.elevenVoices();
        save(); rerender(); toast("Список загружен"); } catch(e){ toast(e.message); b.textContent = "Список"; } });
    blk.querySelectorAll(".vtest").forEach(b => b.onclick = () => speak(l==="en" ? "Practice makes perfect." : "Практика — путь к совершенству.", lang));
  });
  $("#voiceGuide").onclick = () => guideSheet("all", rerender);
  $("#rate").oninput = e => { S.set.rate = +e.target.value; $("#rateLab").textContent = Math.round(S.set.rate*100)+"%"; save(); };
  $("#ttsFlush").onclick = async () => { if("caches" in window) await caches.delete("shadowfox-tts-v2"); TTS.cacheP = null; toast("Кэш озвучки очищен"); };
}

/* ---------- мастер подключения: пошагово, с кнопками «открыть страницу», «вставить ключ», «проверить» ---------- */
const GUIDES = {
  system: { title:"Голоса телефона", tags:ENGINES.system.tags, steps:[
    ["Android: открой настройки телефона","Настройки → Система → Язык и ввод → Преобразование текста в речь. Выбери движок Google, нажми шестерёнку → «Установить голосовые данные». Скачай English (US / UK / Australia) и Русский — там по несколько голосов и офлайн-варианты."],
    ["Android: больше голосов — сторонние движки","Бесплатно из Google Play: «Piper TTS» (нейросетевые) или «RHVoice» (лучшие русские). После установки выбери его основным движком в тех же настройках — иначе приложение его не увидит.", [["Piper TTS в Google Play","https://play.google.com/store/search?q=piper%20tts&c=apps"],["RHVoice в Google Play","https://play.google.com/store/apps/details?id=com.github.olga_yakovleva.rhvoice.android"]]],
    ["iPhone","Настройки → Универсальный доступ → Устный контент → Голоса → English / Русский. Скачай «улучшенные» и «премиум» голоса — они бесплатны."],
    ["Вернись в приложение","В категории «Из системы телефона» появятся новые голоса. Нажми значок звука, чтобы послушать."] ] },
  piper:  { title:"Встроенные нейросетевые", tags:ENGINES.piper.tags, steps:[
    ["Выбери голос и нажми «Скачать»","Каждый голос — 63 МБ, лучше по Wi-Fi. Хранится в памяти браузера; можно удалить в любой момент."],
    ["Отметь скачанный голос точкой","Он станет основным для языка. Можно скачать несколько и переключаться."],
    ["Работает без интернета","Первый запуск после старта приложения ~1,5 с (загрузка движка), потом мгновенно. Ключей, регистрации и капчи нет."] ] },
  google: { title:"Google Cloud Text-to-Speech", tags:ENGINES.google.tags, steps:[
    ["Что потребуется","Аккаунт Google и банковская карта — Google Cloud требует её привязать даже для бесплатного лимита. В пределах 1 млн символов в месяц списаний нет (это ~50 тыс. озвученных слов). Капча — при регистрации."],
    ["Включи API","Открой страницу, войди в аккаунт, создай проект (любое имя) и нажми «Включить».", [["Открыть Cloud Text-to-Speech API","https://console.cloud.google.com/apis/library/texttospeech.googleapis.com"]]],
    ["Создай ключ","«Создать учётные данные» → «API-ключ». Скопируй его.", [["Открыть страницу ключей","https://console.cloud.google.com/apis/credentials"]]],
    ["Вставь ключ сюда и проверь","Ключ хранится только на этом устройстве.", null, "google"] ] },
  eleven: { title:"ElevenLabs", tags:ENGINES.eleven.tags, steps:[
    ["Что потребуется","Только email. Бесплатный тариф — 10 тыс. символов в месяц (~700 слов с примерами), карта не нужна. При регистрации будет капча."],
    ["Зарегистрируйся","Открой страницу, создай аккаунт.", [["Открыть elevenlabs.io","https://elevenlabs.io/app/sign-up"]]],
    ["Создай ключ","Профиль → API Keys → Create. Скопируй ключ.", [["Открыть страницу ключей","https://elevenlabs.io/app/settings/api-keys"]]],
    ["Вставь ключ сюда и проверь","Ключ хранится только на этом устройстве.", null, "eleven"] ] },
};
function guideSheet(which, rerender){
  const list = which==="all" ? Object.keys(GUIDES) : [which];
  const html = list.map(k => { const g = GUIDES[k]; return `<details class="guide" ${which!=="all"?"open":""}><summary><b>${g.title}</b><span class="row" style="gap:5px;flex-wrap:wrap;margin-top:4px">${tagsHtml(g.tags)}</span></summary>
    <ol class="steps">${g.steps.map(([t,d,links,keyFor]) => `<li><b>${t}</b><p class="small muted">${d}</p>${links?`<div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px">${links.map(([lt,u])=>`<a class="btn secondary small" href="${u}" target="_blank" rel="noopener">${lt} ↗</a>`).join("")}</div>`:""}
      ${keyFor?`<div class="row" style="margin-top:8px"><input class="search grow" id="gk_${keyFor}" type="password" placeholder="Вставь ключ" value="${esc(TTS.keys()[keyFor]||"")}" autocomplete="off" style="padding:9px 12px"><button class="btn ghost small" data-paste="${keyFor}">Вставить</button></div>
      <div class="row" style="margin-top:8px;gap:8px"><button class="btn small" data-check="${keyFor}">Сохранить и проверить</button><span class="small muted grow" id="gk_${keyFor}_st"></span></div>`:""}</li>`).join("")}</ol></details>`; }).join("");
  sheet(`<div class="row between"><h2>Как подключить голоса</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICONS.close}</button></div>
    <p class="small muted">Четыре источника. Два бесплатных и без ключа, два онлайн-сервиса с ключом — мастер проведёт по шагам, страницы открываются отсюда.</p>${html}`);
  // закрытие мастера возвращает в настройки, а не на главный экран
  $("[data-close]").onclick = () => settingsSheet(); $(".scrim").onclick = e => { if(e.target===e.currentTarget) settingsSheet(); };
  document.querySelectorAll("[data-paste]").forEach(b => b.onclick = async () => { try{ const t = await navigator.clipboard.readText(); $("#gk_"+b.dataset.paste).value = t.trim(); }catch(e){ toast("Буфер недоступен — вставь ключ вручную"); } });
  document.querySelectorAll("[data-check]").forEach(b => b.onclick = async () => { const k = b.dataset.check, inp = $("#gk_"+k), st = $("#gk_"+k+"_st"); const val = inp.value.trim(); if(!val){ st.textContent = "Ключ пустой"; return; }
    TTS.keys()[k] = val; save(); st.textContent = "Проверяю…";
    try { const vs = k==="google" ? await TTS.googleVoices("en") : await TTS.elevenVoices(); st.textContent = "Ключ работает · доступно " + plural(vs.length,"голос","голоса","голосов");
      const keys = TTS.keys(); if(k==="google"){ keys.googleList = keys.googleList || {}; keys.googleList.en = vs; keys.googleList.ru = await TTS.googleVoices("ru").catch(()=>GOOGLE_VOICES.ru); } else keys.elevenList = vs;
      ["en","ru"].forEach(l => { const cfg = TTS.cfg(l==="en"?"en-US":"ru-RU"); if(cfg.engine===k && !cfg.voice) cfg.voice = (k==="google" ? keys.googleList[l] : vs)[0]?.[0]; });
      save(); rerender && rerender(); toast("Ключ подключён"); }
    catch(e){ st.textContent = "Не сработало: " + (e.message||"проверь ключ и интернет"); } });
}
