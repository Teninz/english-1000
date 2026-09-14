package io.github.teninz.shadowfox.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import io.github.teninz.shadowfox.data.Dictionary
import io.github.teninz.shadowfox.data.Store
import io.github.teninz.shadowfox.data.Word
import io.github.teninz.shadowfox.speech.Stt
import io.github.teninz.shadowfox.speech.Tts
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/** Вопрос сессии: вид и слово (для «пар» — группа слов). */
data class Question(val kind: String, val word: Word? = null, val group: List<Word> = emptyList())
data class Answer(val word: Word, val ok: Boolean, val kind: String)
/** Активная сессия проверки/повторения. */
class Session(val title: String, val mode: String, val items: List<Question>, val after: String = "test") {
    var k by mutableStateOf(0)
    val res = mutableListOf<Answer>()
    val startedAt = System.currentTimeMillis()
}

sealed class Screen(val tab: String) {
    object Home : Screen("home"); object Learn : Screen("learn"); object Test : Screen("test"); object Road : Screen("road"); object Words : Screen("words")
    data class Cards(val words: List<Word>) : Screen("learn")
    data class Quiz(val session: Session) : Screen("test")
    data class Results(val session: Session) : Screen("test")
}

/** Общее состояние приложения: словарь, хранилище, речь, навигация. */
class AppModel(app: Application) : AndroidViewModel(app) {
    val words: List<Word> = Dictionary.load(app)
    val store = Store(app)
    val tts = Tts(app)
    val stt = Stt(app)

    var screen by mutableStateOf<Screen>(Screen.Home)
    var learnLevel by mutableStateOf(-1)
    var testScope by mutableStateOf("due")
    var testLevel by mutableStateOf(0)
    var toast by mutableStateOf<String?>(null)
    private var toastJob: Job? = null

    val state get() = store.state

    fun go(s: Screen) { tts.stop(); screen = s }
    fun showToast(msg: String) { toast = msg; toastJob?.cancel(); toastJob = viewModelScope.launch { kotlinx.coroutines.delay(2200); toast = null } }

    fun speak(text: String, lang: String = "en-US") { viewModelScope.launch { speakAwait(text, lang) } }
    suspend fun speakAwait(text: String, lang: String = "en-US") {
        val s = store.s.set
        tts.speak(text, lang, s.rate, if (lang.startsWith("ru")) s.ruVoice else s.enVoice)
    }

    fun currentLearnLevel(): Int {
        val un = store.unstarted(words)
        if (learnLevel < 0 || un.none { it.level == learnLevel }) learnLevel = un.firstOrNull()?.level ?: 0
        return learnLevel
    }

    /** Выборка слов для проверки по текущему scope. */
    fun scopeWords(): List<Word> = when (testScope) {
        "due" -> store.due(words); "all" -> store.started(words); "hard" -> store.hardList(words)
        else -> words.filter { it.level == testLevel }
    }

    /** Вид вопроса растёт вместе с ячейкой: выбор → обратный → слух/пропуск → письмо. */
    fun kindForBox(box: Int, w: Word): String = when {
        box <= 1 -> "mc"; box == 2 -> "rev"
        box == 3 -> if (stt.available()) "listen" else if (Dictionary.wordRegex(w.en).containsMatchIn(w.ex)) "gap" else "rev"
        else -> "type"
    }

    fun startReview() {
        val due = store.due(words).shuffled().take(15)
        if (due.isEmpty()) { showToast("Пока нечего повторять"); return }
        go(Screen.Quiz(Session("Повторение", "review", due.map { Question(kindForBox(store.progress(it)!!.box, it), it) }, "home")))
    }

    fun launchTest(mode: String) {
        var pool = scopeWords()
        if (mode == "gap") pool = pool.filter { Dictionary.wordRegex(it.en).containsMatchIn(it.ex) }
        if (mode == "pron" && !stt.available()) { showToast("На этом телефоне нет распознавания речи"); return }
        if (pool.size < 4) { showToast(if (testScope == "hard") "Пометь флажком хотя бы 4 слова" else "Слишком мало слов в этой выборке — сначала выучи хотя бы 5"); return }
        val picked = pool.shuffled().take(if (mode == "exam") 20 else 10)
        val items = when (mode) {
            "pairs" -> picked.chunked(5).filter { it.size >= 2 }.map { Question("pairs", group = it) }
            "exam" -> { val kinds = listOf("mc", "rev", "type", "gap") + (if (stt.available()) listOf("listen") else emptyList())
                picked.mapIndexed { i, w -> var k = kinds[i % kinds.size]; if (k == "gap" && !Dictionary.wordRegex(w.en).containsMatchIn(w.ex)) k = "mc"; Question(k, w) } }
            else -> picked.map { Question(mode, it) }
        }
        go(Screen.Quiz(Session(modeTitle(mode), mode, items)))
    }

    fun modeTitle(mode: String) = when (mode) {
        "mc" -> "Выбор перевода"; "rev" -> "Обратный выбор"; "type" -> "Написание"; "listen" -> "На слух"; "pron" -> "Произношение"
        "pairs" -> "Пары"; "gap" -> "Пропуск в предложении"; "exam" -> "Экзамен"; "review" -> "Повторение"; "learn" -> "Проверка порции"; else -> mode
    }

    /** Четыре варианта ответа: правильный + 3 отвлекающих той же части речи без повторов. */
    fun options(w: Word, field: (Word) -> String): List<Word> {
        val same = words.filter { it.index != w.index && it.pos == w.pos && field(it) != field(w) }.shuffled()
        val other = words.filter { it.index != w.index && field(it) != field(w) }.shuffled()
        val pick = (same.take(3) + other).distinctBy { field(it) }.filter { field(it) != field(w) }.take(3)
        return (pick + w).shuffled()
    }

    override fun onCleared() { tts.release() }
}
