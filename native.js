// Мост к Android-оболочке (Capacitor). В обычном браузере не делает ничего.
// В WebView нет Web Speech API, поэтому озвучка и распознавание идут через нативные плагины.
const NATIVE = (() => {
  const C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null;
  const P = C.Plugins;
  return { C, P, tts: P.TextToSpeech, stt: P.SpeechRecognition, haptics: P.Haptics, awake: P.KeepAwake, app: P.App, browser: P.Browser, notif: P.LocalNotifications };
})();

if (NATIVE) {
  // Монотонные часы Android: не зависят от ручной смены даты и продолжают идти в фоне.
  window.nativeExamClock = () => NATIVE.P.Clock.now().then(r => Number(r.elapsedRealtime));
  // --- системные голоса Android ---
  let nativeVoices = [];
  const refreshVoices = () => NATIVE.tts.getSupportedVoices().then(r => { nativeVoices = (r.voices || []).map((v, i) => Object.assign({ index: i }, v)); pickVoices(); }).catch(() => {});
  refreshVoices();
  // подменяем функции из index.html / tts.js
  window.voicesFor = lang => nativeVoices.filter(v => new RegExp("^" + lang, "i").test(v.lang)).sort((a, b) => a.name.localeCompare(b.name));
  window.pickVoices = function () {
    const saved = key => S && S.set[key] ? nativeVoices.find(v => v.voiceURI === S.set[key] || v.name === S.set[key]) : null;
    enVoice = saved("enVoice") || nativeVoices.find(v => /^en[-_]US/i.test(v.lang)) || nativeVoices.find(v => /^en/i.test(v.lang)) || null;
    ruVoice = saved("ruVoice") || nativeVoices.find(v => /^ru/i.test(v.lang)) || null;
  };
  window.canSpeak = () => true;
  TTS.system = function (text, lang) {
    const v = lang.startsWith("ru") ? ruVoice : enVoice;
    const rate = (S.set.rate || 1) * (lang.startsWith("ru") ? 1 : 0.9);
    const opts = { text, lang: v ? v.lang : lang, rate, pitch: 1, volume: 1, queueStrategy: 0 };
    if (v) opts.voice = v.index;
    return NATIVE.tts.speak(opts).catch(() => {});
  };
  const origStop = TTS.stop.bind(TTS);
  TTS.stop = function () { origStop(); NATIVE.tts.stop().catch(() => {}); };

  // --- распознавание речи через Android SpeechRecognizer ---
  window.canListen = () => true;
  let recActive = false;
  window.listen = async function (lang, timeout = 8000) {
    try {
      const perm = await NATIVE.stt.checkPermissions();
      if (perm.speechRecognition !== "granted") { const r = await NATIVE.stt.requestPermissions(); if (r.speechRecognition !== "granted") return { error: "not-allowed" }; }
      const av = await NATIVE.stt.available(); if (!av.available) return { error: "unsupported" };
      recActive = true;
      // по таймауту не бросаем распознаватель, а останавливаем его: Android тогда отдаёт то, что успел услышать
      const stopTimer = setTimeout(() => { NATIVE.stt.stop().catch(() => {}); }, timeout);
      const hardStop = new Promise(r => setTimeout(() => r({ matches: [] }), timeout + 4000));
      let res;
      try { res = await Promise.race([NATIVE.stt.start({ language: lang, maxResults: 5, partialResults: false, popup: false }), hardStop]); }
      finally { clearTimeout(stopTimer); recActive = false; }
      return { alts: (res && res.matches) || [] };
    } catch (e) {
      recActive = false;
      const m = String(e && e.message || e).toLowerCase();
      if (/permission|denied|not-allowed/.test(m)) return { error: "not-allowed" };
      if (/network/.test(m)) return { error: "network" };
      return { alts: [] }; // no match / speech timeout / already listening — просто нет ответа
    }
  };
  window.stopListening = () => { recActive = false; NATIVE.stt.stop().catch(() => {}); };

  // --- цвет значков статус-бара под тему ---
  const origApplyTheme = window.applyTheme;
  window.applyTheme = function () { origApplyTheme.apply(this, arguments); const light = (S.set.theme || "dark") === "light"; NATIVE.P.SystemBars && NATIVE.P.SystemBars.setStyle({ style: light ? "LIGHT" : "DARK" }).catch(() => {}); };
  window.applyTheme();

  // --- вибрация, удержание экрана ---
  window.buzz = ok => { try { NATIVE.haptics.impact({ style: ok ? "LIGHT" : "HEAVY" }); } catch (e) {} };
  const origHfStart = window.hfStart, origHfStop = window.hfStop, origHfSet = window.hfSet, origHfToggle = window.hfTogglePause;
  const Road = NATIVE.P.Road;
  // фоновый сервис: плеер в шторке и на экране блокировки, процесс живёт при погашенном экране
  window.hfStart = async function () {
    NATIVE.awake.keepAwake().catch(() => {});
    // микрофон спрашиваем до старта: иначе фоновый сервис не получит право на запись в фоне
    if (hfMode !== "listen") { try { const p = await NATIVE.stt.checkPermissions(); if (p.speechRecognition !== "granted") await NATIVE.stt.requestPermissions(); } catch (e) {} }
    const r = await origHfStart.apply(this, arguments);
    if (hf.on && Road) setTimeout(() => { if (hf.on) Road.start({ word: "ShadowFox Eng", ru: "Режим «В дороге»" }).catch(() => {}); }, 300);
    return r; };
  window.hfStop = function () { NATIVE.awake.allowSleep().catch(() => {}); if (Road) Road.stop().catch(() => {}); return origHfStop.apply(this, arguments); };
  let roadLast = "";
  window.hfSet = function (status, cls, word, ru) { origHfSet.apply(this, arguments); if (!hf.on || !Road) return;
    const w = word !== undefined ? word : (document.getElementById("hfWord") || {}).textContent || "", r = ru !== undefined ? ru : (document.getElementById("hfRu") || {}).textContent || "";
    const key = w + "|" + r + "|" + hf.paused; if (key === roadLast) return; roadLast = key; Road.update({ word: w || "ShadowFox Eng", ru: r || status, paused: !!hf.paused }).catch(() => {}); };
  window.hfTogglePause = function () { origHfToggle.apply(this, arguments); if (hf.on && Road) { roadLast = ""; hfSet(hf.paused ? "Пауза" : "Говорю"); } };
  if (Road) Road.addListener("command", d => { if (!hf.on) return;
    if (d.cmd === "pause" && !hf.paused) hfTogglePause(); else if (d.cmd === "resume" && hf.paused) hfTogglePause();
    else if (d.cmd === "next") { const b = document.getElementById("hfNext"); if (b) b.click(); }
    else if (d.cmd === "stop") { endSession(); go("road"); } });

  // --- внешние ссылки открываем в браузере телефона, а не внутри приложения ---
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href^='http']");
    if (a) { e.preventDefault(); NATIVE.browser.open({ url: a.href }).catch(() => {}); }
  }, true);

  // --- кнопка «назад»: закрыть панель → вернуться на главную → свернуть приложение ---
  NATIVE.app.addListener("backButton", () => {
    if (companionDrawerOpen()) { closeCompanion(); return; }
    if (document.querySelector(".scrim")) { closeSheet(); return; }
    if (typeof thematicExamRunning === "function" && thematicExamRunning()) { thematicRequestExamExit("thematic"); return; }
    if (inSession) { endSession(); go(tab); return; }
    if (tab === "thematic" && thematicCurrent) { renderThematicCatalog(); return; }
    if (tab !== "home") { go("home"); return; }
    NATIVE.app.minimizeApp();
  });

  // --- ярлыки и виджет открывают нужный экран: shadowfox://open?screen=learn&word=… ---
  const handleUrl = url => {
    try { const u = new URL(url); const sc = u.searchParams.get("screen"), w = u.searchParams.get("word");
      if (w) { const i = WORDS.findIndex(x => x[0] === w); if (i >= 0) { go("words"); query = w; renderWords(); wordSheet(i); return; } }
      if (sc === "journey") { endSession(); journeyStart(); return; }
      if (sc === "companion") { endSession(); go("home"); openCompanion(); return; }
      if (sc === "review") { dueList().length ? startReview() : go("home"); return; }
      if (sc === "hard") { go("words"); wordsFilter = "hard"; renderWords(); return; }
      if (sc && ["home","learn","test","road","words","thematic"].includes(sc)) go(sc);
    } catch (e) {}
  };
  NATIVE.app.addListener("appUrlOpen", d => handleUrl(d.url));
  NATIVE.app.getLaunchUrl().then(d => { if (d && d.url) handleUrl(d.url); }).catch(() => {});

  // --- виджет «Слово для повторения»: после каждого сохранения отдаём ему очередь слов ---
  let widgetTimer = null;
  window.updateWidget = function (now) {
    clearTimeout(widgetTimer);
    const run = () => { try {
      const pack = i => [WORDS[i][0], WORDS[i][1], WORDS[i][3], EX_RU[WORDS[i][0]] || "", levelOf(i) + 1];
      const due = dueList().sort((a, b) => (W(a).due < W(b).due ? -1 : 1)).slice(0, 30);
      let list, kind;
      if (due.length) { list = due; kind = "due"; }
      else { const un = unstartedList(); const lvl = un.length ? levelOf(un[0]) : 0; list = un.filter(i => levelOf(i) === lvl).slice(0, 10); kind = "new"; }
      NATIVE.P.Widget.update({ words: JSON.stringify(list.map(pack)), kind, total: dueList().length, theme: S.set.widgetTheme || "dark" }).catch(() => {});
    } catch (e) {} };
    if (now) run(); else widgetTimer = setTimeout(run, 1500);
  };
  const origSave = window.save;
  window.save = function () { const saved=origSave.apply(this, arguments); if(saved!==false)updateWidget(false); return saved; };
  updateWidget(true);

  // В Android действия с лисой выполняет тот же репозиторий, что и виджет.
  let companionChain=Promise.resolve();
  const companionQueue=fn=>{const job=companionChain.then(fn);companionChain=job.catch(()=>{});return job;};
  window.syncCompanion = () => companionQueue(async()=>{
    journeyState();
    const r=await NATIVE.P.Widget.companionSync({state:S.companion});
    S.companion=LearningCore.petKeepChoice(r.state,S.companion);
    for(const day of Object.keys(r.state.completed))S.journey.completed[day]=1;
    origSave();
    if(companionDrawerOpen()&&!inSession&&!$(".scrim"))openCompanion();
    return r.state;
  }).catch(()=>{toast("Не удалось синхронизировать лису с виджетом");});
  window.nativeCompanionAction = action => companionQueue(async()=>{const r=await NATIVE.P.Widget.companionAction({action});r.state=LearningCore.petKeepChoice(r.state,S.companion);return r;});
  window.resetCompanion = () => companionQueue(()=>NATIVE.P.Widget.companionReset()).catch(()=>toast("Не удалось сбросить виджет лисы"));
  window.shareProgressFile = content => NATIVE.P.Widget.shareProgress({content});
  window.pinCompanion = async()=>{const r=await NATIVE.P.Widget.companionPin();if(!r.supported)toast("Удерживай рабочий стол → Виджеты → ShadowFox → Лиса-компаньон");};
  NATIVE.app.addListener("appStateChange",s=>{if(s.isActive)syncCompanion();});
  syncCompanion();

  // --- набор анимаций лисы: скачивается по кнопке и хранится в приватной папке приложения (как контент в играх) ---
  // Файлы берутся с GitHub Releases по версии из manifest.js; в APK лежат только постеры. Пока набора нет — лиса неподвижна.
  window.foxPackStore = (() => {
    const FS = NATIVE.P.Filesystem, KEY = "foxPack", DIR = "DATA";
    const pack = () => (typeof FOX_PACK !== "undefined" ? FOX_PACK : {version:0});
    const base = () => pack().base || `https://github.com/Teninz/english-1000/releases/download/fox-pack-${pack().version}/`;
    const flat = path => path.split("/").join("__");
    const local = path => `fox-pack/${pack().version}/${flat(path)}`;
    const record = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } };
    const save = r => localStorage.setItem(KEY, JSON.stringify(r));
    let urls = {}, state = "missing", percent = 0, error = "";
    // WebView не воспроизводит <video> по внутреннему адресу _capacitor_file_, поэтому файл читается целиком
    // и отдаётся плееру как blob-URL. Сначала через fetch (быстро), при неудаче — через readFile (base64).
    async function blobUrl(path) {
      const u = await FS.getUri({ path: local(path), directory: DIR });
      try {
        const res = await fetch(NATIVE.C.convertFileSrc(u.uri));
        if (!res.ok) throw new Error("HTTP " + res.status);
        return URL.createObjectURL(await res.blob());
      } catch (e) {
        const r = await FS.readFile({ path: local(path), directory: DIR });
        const bin = atob(r.data), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return URL.createObjectURL(new Blob([bytes], { type: "video/webm" }));
      }
    }
    async function init() {
      const r = record();
      if (!FS) { state = "missing"; return; }
      if (r.version !== pack().version) { state = r.version ? "stale" : "missing"; return; }
      const files = foxPackFiles();
      const next = {};
      for (const f of files) {
        try { const st = await FS.stat({ path: local(f.path), directory: DIR }); if (!(st.size > 1000)) throw new Error("empty"); next[f.path] = await blobUrl(f.path); }
        catch (e) { for (const old of Object.values(next)) URL.revokeObjectURL(old); state = "missing"; error = "Набор повреждён: " + (e && e.message || e); return; }
      }
      for (const old of Object.values(urls)) URL.revokeObjectURL(old);
      urls = next; state = "ready";
    }
    async function download(onProgress) {
      if (!FS || state === "downloading") return;
      state = "downloading"; percent = 0; error = "";
      const files = foxPackFiles(), total = Math.max(1, files.reduce((s, f) => s + f.kb * 1024, 0));
      let done = 0, current = 0;
      // downloadFile не создаёт папку назначения даже с recursive — делаем это сами (ошибка «уже существует» безвредна).
      try { await FS.mkdir({ path: `fox-pack/${pack().version}`, directory: DIR, recursive: true }); } catch (e) {}
      const handle = await FS.addListener("progress", p => { current = p.bytes || 0; const pct = Math.min(99, Math.round((done + current) / total * 100)); if (pct !== percent) { percent = pct; onProgress && onProgress(pct); } });
      try {
        for (const f of files) {
          let exists = false;
          try { const st = await FS.stat({ path: local(f.path), directory: DIR }); exists = st.size > 1000; } catch (e) {}
          if (!exists) await FS.downloadFile({ url: base() + flat(f.path), path: local(f.path), directory: DIR, recursive: true, progress: true });
          done += f.kb * 1024; current = 0;
          percent = Math.min(99, Math.round(done / total * 100)); onProgress && onProgress(percent);
        }
        save({ version: pack().version, day: today() });
        await init();
        if (state !== "ready") throw new Error("Файлы не прошли проверку после загрузки");
        percent = 100; onProgress && onProgress(100);
      } catch (e) {
        state = record().version === pack().version ? "ready" : "missing";
        const reason = String(e && e.message || "").replace(/^Error downloading file:\s*/i, "").replace(/^\/data\/[^:]*:\s*/i, "");
        error = "Не удалось загрузить: " + (reason || "проверь интернет");
        if (state === "ready") await init();
        throw e;
      } finally { handle.remove(); }
    }
    async function remove() {
      try { await FS.rmdir({ path: "fox-pack", directory: DIR, recursive: true }); } catch (e) {}
      localStorage.removeItem(KEY); for (const old of Object.values(urls)) URL.revokeObjectURL(old); urls = {}; state = "missing"; percent = 0;
    }
    init().then(() => { if (state === "ready" && companionDrawerOpen() && !inSession && !$(".scrim")) { closeCompanion(); openCompanion(); } });
    // Ошибка воспроизведения из плеера (journey.js): показывается в блоке набора, чтобы её можно было прочитать на телефоне.
    window.foxPackMediaError = (path, code, msg) => { error = `Видео не запускается (${code}${msg ? ": " + msg : ""}): ${path}`; };
    let probe = "";
    // Источники для диагностики: скачанный файл напрямую (_capacitor_file_), тот же файл через память, data-URL.
    async function probeSources(path) {
      const out = {};
      try { const u = await FS.getUri({ path: local(path), directory: DIR }); out["файл"] = NATIVE.C.convertFileSrc(u.uri); } catch (e) { out["файл"] = null; }
      out["файл→память"] = urls[path] || null;
      try { const r = await FS.readFile({ path: local(path), directory: DIR }); out["data-url"] = "data:video/webm;base64," + r.data; } catch (e) { out["data-url"] = null; }
      return out;
    }
    return { ready: () => state === "ready", url: path => urls[path] || null, status: () => ({ state, percent, error, probe }), download, remove, probeSources, setProbe: text => { probe = text; } };
  })();

  // --- ежедневное напоминание (настраивается в настройках через S.set.remind = "HH:MM" | null) ---
  window.scheduleReminder = async function () {
    try {
      await NATIVE.notif.cancel({ notifications: [{ id: 1 }] });
      if (!S.set.remind) return;
      const p = await NATIVE.notif.requestPermissions(); if (p.display !== "granted") return;
      const [h, m] = S.set.remind.split(":").map(Number);
      await NATIVE.notif.schedule({ notifications: [{ id: 1, title: "ShadowFox Eng", body: "Пора повторить слова — 5 минут, и серия дней не прервётся", schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }, smallIcon: "ic_stat_fox" }] });
    } catch (e) {}
  };
  NATIVE.notif.addListener("localNotificationActionPerformed", () => { dueList().length ? startReview() : go("home"); });
  scheduleReminder();
}
