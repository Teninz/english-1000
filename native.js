// Мост к Android-оболочке (Capacitor). В обычном браузере не делает ничего.
// В WebView нет Web Speech API, поэтому озвучка и распознавание идут через нативные плагины.
const NATIVE = (() => {
  const C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null;
  const P = C.Plugins;
  return { C, P, tts: P.TextToSpeech, stt: P.SpeechRecognition, haptics: P.Haptics, awake: P.KeepAwake, app: P.App, browser: P.Browser, notif: P.LocalNotifications };
})();

if (NATIVE) {
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
      const res = await Promise.race([
        NATIVE.stt.start({ language: lang, maxResults: 5, partialResults: false, popup: false }),
        new Promise(r => setTimeout(() => r({ matches: [] }), timeout)),
      ]);
      recActive = false;
      return { alts: (res && res.matches) || [] };
    } catch (e) {
      recActive = false;
      const m = String(e && e.message || e).toLowerCase();
      if (/permission|denied/.test(m)) return { error: "not-allowed" };
      if (/network/.test(m)) return { error: "network" };
      if (/no match|no speech|speech timeout|7|6/.test(m)) return { alts: [] };
      return { alts: [] };
    }
  };
  window.stopListening = () => { if (recActive) { recActive = false; NATIVE.stt.stop().catch(() => {}); } };

  // --- вибрация, удержание экрана ---
  window.buzz = ok => { try { NATIVE.haptics.impact({ style: ok ? "LIGHT" : "HEAVY" }); } catch (e) {} };
  const origHfStart = window.hfStart, origHfStop = window.hfStop;
  window.hfStart = async function () { NATIVE.awake.keepAwake().catch(() => {}); return origHfStart.apply(this, arguments); };
  window.hfStop = function () { NATIVE.awake.allowSleep().catch(() => {}); return origHfStop.apply(this, arguments); };

  // --- внешние ссылки открываем в браузере телефона, а не внутри приложения ---
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href^='http']");
    if (a) { e.preventDefault(); NATIVE.browser.open({ url: a.href }).catch(() => {}); }
  }, true);

  // --- кнопка «назад»: закрыть панель → вернуться на главную → свернуть приложение ---
  NATIVE.app.addListener("backButton", () => {
    if (document.querySelector(".scrim")) { closeSheet(); return; }
    if (inSession) { endSession(); go(tab); return; }
    if (tab !== "home") { go("home"); return; }
    NATIVE.app.minimizeApp();
  });

  // --- ярлыки и виджет открывают нужный экран: shadowfox://open?screen=learn&word=… ---
  const handleUrl = url => {
    try { const u = new URL(url); const sc = u.searchParams.get("screen"), w = u.searchParams.get("word");
      if (w) { const i = WORDS.findIndex(x => x[0] === w); if (i >= 0) { go("words"); query = w; renderWords(); wordSheet(i); return; } }
      if (sc === "review") { dueList().length ? startReview() : go("home"); return; }
      if (sc === "hard") { go("words"); wordsFilter = "hard"; renderWords(); return; }
      if (sc && ["home","learn","test","road","words"].includes(sc)) go(sc);
    } catch (e) {}
  };
  NATIVE.app.addListener("appUrlOpen", d => handleUrl(d.url));
  NATIVE.app.getLaunchUrl().then(d => { if (d && d.url) handleUrl(d.url); }).catch(() => {});

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
