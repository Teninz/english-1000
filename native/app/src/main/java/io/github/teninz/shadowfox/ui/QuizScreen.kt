package io.github.teninz.shadowfox.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.draw.alpha
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Mic
import io.github.teninz.shadowfox.data.Dictionary
import io.github.teninz.shadowfox.data.Word
import io.github.teninz.shadowfox.speech.SttResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

fun norm(s: String) = s.lowercase().replace('ё', 'е').replace(Regex("[’']"), "'").replace(Regex("[.,!?;:\"«»()]"), " ").replace(Regex("\\s+"), " ").trim()
fun lev(a: String, b: String): Int { val d = Array(a.length + 1) { IntArray(b.length + 1) }; for (i in 0..a.length) d[i][0] = i; for (j in 0..b.length) d[0][j] = j
    for (i in 1..a.length) for (j in 1..b.length) d[i][j] = minOf(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + if (a[i - 1] == b[j - 1]) 0 else 1); return d[a.length][b.length] }
/** Совпал ли какой-то из распознанных вариантов с целями: точно, как слово внутри фразы, с опечаткой или по основе. */
fun matchAny(alts: List<String>, targets: List<String>): Boolean = alts.any { a -> val na = norm(a); na.isNotEmpty() && targets.any { t ->
    t.isNotEmpty() && (na == t || (t.length >= 3 && Regex("(^| )" + Regex.escape(t) + "( |$)").containsMatchIn(na)) || (t.length >= 4 && lev(na, t) <= maxOf(1, t.length / 5))
        || (t.length >= 6 && na.split(" ").any { tok -> tok.length >= 5 && tok.take(t.length - 3) == t.take(t.length - 3) })) } }

/** Экран одного вопроса сессии. */
@Composable
fun QuizScreen(vm: AppModel, sess: Session) {
    val p = P
    if (sess.k >= sess.items.size) { LaunchedEffect(Unit) { vm.go(Screen.Results(sess)) }; return }
    val q = sess.items[sess.k]
    var answered by remember(sess.k) { mutableStateOf<Boolean?>(null) }
    var extra by remember(sess.k) { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    fun record(w: Word, ok: Boolean, kind: String, note: String? = null) { sess.res.add(Answer(w, ok, kind)); vm.store.grade(w, ok, kind); answered = ok; extra = note
        if (ok) scope.launch { delay(if (note != null) 1600 else 700); if (sess.k < sess.items.size && answered == true) sess.k++ } }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        SessionTop(vm, sess.k, sess.items.size) { vm.go(if (sess.after == "home") Screen.Home else if (sess.after == "learn") Screen.Learn else Screen.Test) }
        when (q.kind) {
            "mc" -> { val w = q.word!!; val opts = remember(sess.k) { vm.options(w) { it.ru } }
                LaunchedEffect(sess.k) { if (vm.store.s.set.auto) vm.speak(w.en) }
                Prompt("Что это значит?") { Text(w.en, style = MaterialTheme.typography.displayMedium, color = p.ink, textAlign = TextAlign.Center); Text(Dictionary.posNames[w.pos] ?: "", fontSize = 12.sp, color = p.muted); SpeakButton({ vm.speak(w.en) }) }
                Options(opts.map { it.ru }, opts.indexOf(w), answered) { i -> record(w, opts[i] == w, "mc") } }
            "rev", "listen", "gap" -> { val w = q.word!!; val opts = remember(sess.k) { vm.options(w) { it.en } }
                if (q.kind == "listen") LaunchedEffect(sess.k) { delay(200); vm.speak(w.en) }
                when (q.kind) {
                    "rev" -> Prompt("Как это по-английски?") { Text(w.ru, fontSize = 26.sp, fontWeight = FontWeight.Medium, color = p.ink, textAlign = TextAlign.Center); Text(Dictionary.posNames[w.pos] ?: "", fontSize = 12.sp, color = p.muted) }
                    "listen" -> Prompt("Что ты слышишь?") { SpeakButton({ vm.speak(w.en) }, big = true); Text("нажми, чтобы послушать ещё раз", fontSize = 13.sp, color = p.faint) }
                    else -> { val m = Dictionary.wordRegex(w.en).find(w.ex); Prompt("Какое слово пропущено?") {
                        Text(if (m == null) w.ex else w.ex.replaceRange(m.range, " ______ "), fontFamily = WordFont, fontSize = 22.sp, color = p.ink, textAlign = TextAlign.Center); Text(w.ru, fontSize = 12.sp, color = p.muted) } }
                }
                Options(opts.map { it.en }, opts.indexOf(w), answered, mono = true) { i -> record(w, opts[i] == w, q.kind) } }
            "type" -> { val w = q.word!!; var text by remember(sess.k) { mutableStateOf("") }; var hint by remember(sess.k) { mutableStateOf(false) }
                Prompt("Напиши по-английски") { Text(w.ru, fontSize = 26.sp, fontWeight = FontWeight.Medium, color = p.ink, textAlign = TextAlign.Center); Text((Dictionary.posNames[w.pos] ?: "") + " · ${w.en.replace(" ", "").length} букв", fontSize = 12.sp, color = p.muted)
                    if (hint) Text(w.ex.replace(Dictionary.wordRegex(w.en)) { w.en.first() + "…" }, fontSize = 15.sp, color = p.muted, textAlign = TextAlign.Center) }
                OutlinedTextField(text, { text = it }, Modifier.fillMaxWidth(), enabled = answered == null, singleLine = true, textStyle = MaterialTheme.typography.displaySmall.copy(fontSize = 22.sp, textAlign = TextAlign.Center),
                    keyboardActions = KeyboardActions(onDone = { }), placeholder = { Text("…") })
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryButton("Подсказка", Modifier.weight(1f)) { hint = true }
                    PrimaryButton("Проверить", Modifier.weight(1f), enabled = answered == null) { val a = norm(text); val t = norm(w.en); if (a.isEmpty()) return@PrimaryButton
                        val ok = a == t; val near = !ok && t.length >= 5 && lev(a, t) == 1; record(w, ok || near, "type", if (near) "Почти — одна опечатка, засчитано" else null) }
                } }
            "pron" -> { val w = q.word!!; var heard by remember(sess.k) { mutableStateOf("Сначала послушай образец, потом нажми микрофон и скажи слово") }; var busy by remember(sess.k) { mutableStateOf(false) }
                Prompt("Произнеси это слово") { Text(w.en, style = MaterialTheme.typography.displayMedium, color = p.ink, textAlign = TextAlign.Center); Text(w.ru, fontSize = 12.sp, color = p.muted)
                    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) { SpeakButton({ vm.speak(w.en) })
                        Box(Modifier.size(96.dp).clip(androidx.compose.foundation.shape.CircleShape).background(if (busy) p.bad else p.accent).clickable(enabled = !busy && answered == null) {
                            busy = true; heard = "Слушаю…"; scope.launch { vm.tts.stop(); Cue.listen(); delay(260)
                                when (val r = vm.stt.listen("en-US", 7000)) {
                                    is SttResult.Error -> heard = when (r.code) { "not-allowed" -> "Нет доступа к микрофону — разреши в настройках телефона"; "network" -> "Распознавание требует интернета"; else -> "Распознавание недоступно" }
                                    is SttResult.Text -> if (r.alts.isEmpty()) heard = "Не расслышал. Нажми микрофон и попробуй ещё раз." else { heard = "Услышано: " + r.alts[0]; record(w, matchAny(r.alts, listOf(norm(w.en))), "pron", if (matchAny(r.alts, listOf(norm(w.en)))) null else "Послушай образец и попробуй в следующий раз") }
                                }; busy = false } }, contentAlignment = Alignment.Center) { androidx.compose.material3.Icon(Icons.Outlined.Mic, contentDescription = "Говорить", tint = p.accentInk, modifier = Modifier.size(44.dp)) } }
                    Text(heard, fontSize = 15.sp, color = p.muted, textAlign = TextAlign.Center) } }
            "pairs" -> PairsQuestion(vm, sess, q.group) { sess.k++ }
        }
        if (answered != null && q.word != null) Feedback(vm, q.word, answered!!, extra) { sess.k++ }
    }
}

@Composable
private fun Prompt(ask: String, content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(P.surface).border(1.dp, P.line.copy(alpha = .6f), RoundedCornerShape(18.dp)).padding(horizontal = 20.dp, vertical = 26.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) { Eyebrow(ask); content() }
}

/** Варианты-«клавиши»: ребро снизу, верный — зелёный, неверный — красный. */
@Composable
private fun Options(items: List<String>, correct: Int, answered: Boolean?, mono: Boolean = false, onPick: (Int) -> Unit) {
    val p = P
    var picked by remember(items) { mutableStateOf(-1) }
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        items.forEachIndexed { i, t ->
            val state = when { answered == null -> ""; i == correct -> "ok"; i == picked -> "no"; else -> "dim" }
            val (bg, bd) = when (state) { "ok" -> p.goodSoft to p.good; "no" -> p.badSoft to p.bad; else -> p.surface to p.line }
            Row(Modifier.fillMaxWidth().padding(bottom = 4.dp).clip(RoundedCornerShape(14.dp)).background(p.ground.copy(alpha = .9f)).padding(bottom = 5.dp).clip(RoundedCornerShape(14.dp)).background(bg).border(2.dp, bd, RoundedCornerShape(14.dp))
                .clickable(enabled = answered == null) { picked = i; onPick(i) }.padding(14.dp).let { if (state == "dim") it.alpha(.4f) else it }, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("${i + 1}", Modifier.size(24.dp).clip(RoundedCornerShape(7.dp)).background(p.surface2).wrapContentSize(), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = p.accentDeep)
                Text(t, fontSize = if (mono) 19.sp else 17.sp, fontFamily = if (mono) WordFont else UiFont, fontWeight = FontWeight.Medium, color = p.ink)
            }
        }
    }
}

@Composable
fun Feedback(vm: AppModel, w: Word, ok: Boolean, extra: String?, onNext: () -> Unit) {
    val p = P
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(if (ok) p.goodSoft else p.badSoft).padding(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(if (ok) "Верно" else "Неверно", fontWeight = FontWeight.Bold, color = if (ok) p.good else p.bad)
                Text(buildString { append(w.en); append(" — "); append(w.ru) }, color = p.ink, fontWeight = FontWeight.Medium)
                if (extra != null) Text(extra, fontSize = 13.sp, color = p.muted)
                if (!ok) { Spacer(Modifier.height(4.dp)); Example(w); Text(w.exRu, fontSize = 13.sp, color = p.muted) }
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) { FlagButton(vm, w); Spacer(Modifier.height(6.dp)); SpeakButton({ vm.speak(w.en) }) }
        }
    }
    PrimaryButton("Дальше") { onNext() }
}

@Composable
private fun PairsQuestion(vm: AppModel, sess: Session, group: List<Word>, onDone: () -> Unit) {
    val p = P
    val left = remember(group) { group.shuffled() }; val right = remember(group) { group.shuffled() }
    var selL by remember(group) { mutableStateOf<Word?>(null) }; var selR by remember(group) { mutableStateOf<Word?>(null) }
    val done = remember(group) { mutableStateListOf<Word>() }; val wrong = remember(group) { mutableSetOf<Word>() }
    var shake by remember(group) { mutableStateOf<Word?>(null) }
    val scope = rememberCoroutineScope()
    fun check() { val a = selL; val b = selR; if (a == null || b == null) return; selL = null; selR = null
        if (a == b) { done.add(a); vm.speak(a.en); sess.res.add(Answer(a, !wrong.contains(a), "pairs")); vm.store.grade(a, !wrong.contains(a), "pairs"); if (done.size == group.size) scope.launch { delay(600); onDone() } }
        else { wrong.add(a); wrong.add(b); shake = a; scope.launch { delay(450); shake = null } } }
    Prompt("Соедини пары") {}
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) { left.forEach { w -> PairCell(w.en, selL == w, done.contains(w), shake == w, mono = true) { selL = if (selL == w) null else w; check() } } }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) { right.forEach { w -> PairCell(w.ru, selR == w, done.contains(w), shake == w && selR == w) { selR = if (selR == w) null else w; check() } } }
    }
}

@Composable
private fun PairCell(text: String, sel: Boolean, done: Boolean, no: Boolean, mono: Boolean = false, onClick: () -> Unit) {
    val p = P
    Box(Modifier.fillMaxWidth().heightIn(min = 60.dp).clip(RoundedCornerShape(14.dp)).background(if (done) p.goodSoft else if (no) p.badSoft else if (sel) p.accentSoft else p.surface).border(2.dp, if (done) p.good else if (no) p.bad else if (sel) p.accent else p.line, RoundedCornerShape(14.dp))
        .clickable(enabled = !done, onClick = onClick).padding(10.dp).let { if (done) it.alpha(.3f) else it }, contentAlignment = Alignment.Center) {
        Text(text, fontSize = if (mono) 19.sp else 15.sp, fontFamily = if (mono) WordFont else UiFont, fontWeight = FontWeight.Medium, color = p.ink, textAlign = TextAlign.Center)
    }
}

@Composable
fun ResultsScreen(vm: AppModel, sess: Session) {
    val p = P
    val n = sess.res.size; val ok = sess.res.count { it.ok }; val pct = if (n > 0) 100 * ok / n else 0
    val verdict = when { pct == 100 -> "Безупречно"; pct >= 80 -> "Отлично"; pct >= 60 -> "Неплохо, но есть над чем поработать"; else -> "Стоит повторить эти слова" }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Card { Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Eyebrow(sess.title); Text("$pct%", fontFamily = WordFont, fontSize = 56.sp, fontWeight = FontWeight.SemiBold, color = p.ink); Text("$ok из $n · $verdict", color = p.muted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(14.dp)); Bar(pct / 100f, good = pct >= 80) } }
        val wrong = sess.res.filter { !it.ok }
        if (wrong.isNotEmpty()) Card { Eyebrow("Ошибки — вернутся на повторение"); Spacer(Modifier.height(10.dp))
            wrong.forEach { a -> Row(Modifier.fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(12.dp)).background(p.surface2).padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(a.word.en, fontFamily = WordFont, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = p.ink); Spacer(Modifier.width(12.dp)); Text(a.word.ru, Modifier.weight(1f), fontSize = 13.sp, color = p.muted); Chip(vm.modeTitle(a.kind).split(" ")[0]) } } }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton("На главную", Modifier.weight(1f)) { vm.go(Screen.Home) }
            PrimaryButton(if (sess.after == "learn") "Ещё порция" else "Ещё раз", Modifier.weight(1f)) { when { sess.after == "learn" -> vm.go(Screen.Learn); sess.mode == "review" -> vm.startReview(); else -> vm.launchTest(sess.mode) } }
        }
    }
}

/** Звуковые сигналы: «блинь» перед микрофоном, короткие тоны верно/неверно. */
object Cue {
    private val tone by lazy { android.media.ToneGenerator(android.media.AudioManager.STREAM_MUSIC, 70) }
    fun listen() = runCatching { tone.startTone(android.media.ToneGenerator.TONE_PROP_BEEP2, 180) }
    fun ok() = runCatching { tone.startTone(android.media.ToneGenerator.TONE_PROP_ACK, 120) }
    fun no() = runCatching { tone.startTone(android.media.ToneGenerator.TONE_PROP_NACK, 200) }
}
