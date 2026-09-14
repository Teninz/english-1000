package io.github.teninz.shadowfox.data

import android.content.Context
import android.util.Base64
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.File
import java.time.LocalDate

/** Прогресс по слову: ячейка Лейтнера 0–6, срок следующего показа, счётчики ответов. */
@Serializable data class WordProgress(var box: Int = 0, var due: String = "", var ok: Int = 0, var bad: Int = 0)
@Serializable data class DayRec(var n: Int = 0, var q: Int = 0, var ok: Int = 0, var bad: Int = 0)
@Serializable data class Streak(var n: Int = 0, var last: String? = null)
@Serializable data class Settings(
    var goal: Int = 10, var auto: Boolean = true, var theme: String = "dark", var scene: String = "town", var motion: Boolean = true,
    var rate: Float = 1f, var enVoice: String? = null, var ruVoice: String? = null, var remind: String? = null, var widgetTheme: String = "dark",
)
/** Всё состояние приложения — один JSON-файл, совместимый по смыслу с веб-версией (S). */
@Serializable data class State(
    var v: Int = 3,
    var w: MutableMap<String, WordProgress> = mutableMapOf(),
    var hard: MutableMap<String, Int> = mutableMapOf(),
    var days: MutableMap<String, DayRec> = mutableMapOf(),
    var streak: Streak = Streak(),
    var modes: MutableMap<String, DayRec> = mutableMapOf(),
    var ach: MutableMap<String, String> = mutableMapOf(),
    var set: Settings = Settings(),
)

object Srs {
    val intervals = listOf(0, 1, 3, 7, 14, 30, 60)
    fun today(): String = LocalDate.now().toString()
    fun addDays(date: String, n: Int): String = LocalDate.parse(date).plusDays(n.toLong()).toString()
}

/** Хранилище: состояние в памяти + атомарная запись JSON в filesDir. */
class Store(private val context: Context) {
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val file = File(context.filesDir, "state.json")
    private val _state = MutableStateFlow(load())
    val state: StateFlow<State> = _state
    val s get() = _state.value

    private fun load(): State = try { if (file.exists()) json.decodeFromString(file.readText()) else State() } catch (e: Exception) { State() }

    fun save() {
        val tmp = File(context.filesDir, "state.json.tmp")
        tmp.writeText(json.encodeToString(_state.value)); tmp.renameTo(file)
        _state.value = _state.value.copy(w = _state.value.w) // уведомить подписчиков
    }
    fun update(block: State.() -> Unit) { _state.value.block(); save() }

    // --- прогресс ---
    fun progress(w: Word) = s.w[w.en]
    fun status(w: Word): Int { val p = s.w[w.en] ?: return 0; return if (p.box >= 6) 3 else if (p.box >= 3) 2 else 1 }
    fun isHard(w: Word) = s.hard.containsKey(w.en)
    fun dayRec(): DayRec = s.days.getOrPut(Srs.today()) { DayRec() }
    private fun touchStreak() { val t = Srs.today(); if (s.streak.last == t) return; s.streak.n = if (s.streak.last == Srs.addDays(t, -1)) s.streak.n + 1 else 1; s.streak.last = t }

    fun grade(w: Word, ok: Boolean, mode: String) = update {
        val r = this.w.getOrPut(w.en) { WordProgress(due = Srs.today()) }
        if (ok) { r.ok++; r.box = minOf(6, r.box + 1) } else { r.bad++; r.box = maxOf(0, r.box - 2) }
        r.due = Srs.addDays(Srs.today(), Srs.intervals[r.box])
        val d = dayRec(); d.q++; if (ok) d.ok++ else d.bad++
        val m = modes.getOrPut(mode) { DayRec() }; if (ok) m.ok++ else m.bad++
        touchStreak()
    }
    fun introduce(w: Word, known: Boolean) = update {
        val r = this.w[w.en]
        if (r == null) { this.w[w.en] = WordProgress(box = if (known) 6 else 0, due = Srs.addDays(Srs.today(), if (known) 60 else 0)); dayRec().n++; touchStreak() }
        else if (known) { r.box = 6; r.due = Srs.addDays(Srs.today(), 60) }
    }
    fun toggleHard(w: Word): Boolean { var on = false; update { if (hard.remove(w.en) == null) { hard[w.en] = 1; on = true } }; return on }
    fun resetWord(w: Word) = update { this.w.remove(w.en) }
    fun resetLevel(level: Int, words: List<Word>) = update { words.filter { it.level == level }.forEach { this.w.remove(it.en) } }
    fun resetProgress() = update { w.clear(); days.clear(); modes.clear(); streak = Streak() }

    fun due(words: List<Word>): List<Word> { val t = Srs.today(); return words.filter { val p = s.w[it.en]; p != null && p.box < 6 && p.due <= t } }
    fun started(words: List<Word>) = words.filter { s.w.containsKey(it.en) }
    fun unstarted(words: List<Word>) = words.filter { !s.w.containsKey(it.en) }
    fun hardList(words: List<Word>) = words.filter { s.hard.containsKey(it.en) }

    // --- перенос: код из веб-версии (base64 JSON состояния S) ---
    fun exportCode(): String = Base64.encodeToString(json.encodeToString(_state.value).toByteArray(), Base64.NO_WRAP)
    fun importCode(code: String): Boolean = try {
        val text = String(Base64.decode(code.trim(), Base64.DEFAULT))
        val obj = Json.parseToJsonElement(text).jsonObject
        val v = obj["v"]?.jsonPrimitive?.content
        if (v == "2") importWeb(obj) else _state.value = json.decodeFromString(text)
        save(); true
    } catch (e: Exception) { false }

    /** Формат веб-версии (v:2) отличается только именами полей настроек — переносим поштучно. */
    private fun importWeb(o: JsonObject) {
        val st = State()
        val lenient = Json { ignoreUnknownKeys = true; isLenient = true }
        o["w"]?.jsonObject?.forEach { (k, v) -> st.w[k] = lenient.decodeFromJsonElement(WordProgress.serializer(), v) }
        o["hard"]?.jsonObject?.keys?.forEach { st.hard[it] = 1 }
        o["days"]?.jsonObject?.forEach { (k, v) -> st.days[k] = lenient.decodeFromJsonElement(DayRec.serializer(), v) }
        o["streak"]?.let { st.streak = lenient.decodeFromJsonElement(Streak.serializer(), it) }
        o["ach"]?.jsonObject?.forEach { (k, v) -> st.ach[k] = v.jsonPrimitive.content }
        o["goal"]?.jsonPrimitive?.content?.toIntOrNull()?.let { st.set.goal = it }
        o["set"]?.jsonObject?.let { s -> s["theme"]?.jsonPrimitive?.content?.let { st.set.theme = it }; s["scene"]?.jsonPrimitive?.content?.let { st.set.scene = it } }
        _state.value = st
    }
}
