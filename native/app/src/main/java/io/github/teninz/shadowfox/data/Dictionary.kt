package io.github.teninz.shadowfox.data

import android.content.Context
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

/** Одно слово словаря. Индекс — позиция в списке, уровень — по 50 слов. */
data class Word(val index: Int, val en: String, val ru: String, val pos: String, val ex: String, val exRu: String) {
    val level get() = index / LEVEL_SIZE
    /** Варианты русского перевода: «предполагать, допускать» → [предполагать, допускать] */
    val ruVariants get() = ru.replace(Regex("\\([^)]*\\)"), "").split(Regex("[,;/]")).map { it.trim().lowercase() }.filter { it.isNotEmpty() }
    companion object { const val LEVEL_SIZE = 50 }
}

object Dictionary {
    val levelNames = listOf("Мнение и мышление", "Работа и карьера", "Бизнес и финансы", "Образование и наука", "Технологии", "Общество и право", "Здоровье и медицина", "Окружающая среда", "Характер и отношения", "Общение и аргументация", "Путешествия и транспорт", "Дом и быт", "Еда и кухня", "Покупки и услуги", "Искусство и медиа", "Прилагательные", "Глаголы", "Фразовые глаголы", "Наречия и связки", "Абстрактные понятия")
    val posNames = mapOf("n" to "сущ.", "v" to "глаг.", "adj" to "прил.", "adv" to "нареч.", "prep" to "предлог", "pron" to "местоим.", "conj" to "союз", "num" to "числ.", "det" to "определитель", "int" to "междом.")

    @Volatile private var cache: List<Word>? = null

    fun load(context: Context): List<Word> = cache ?: synchronized(this) {
        cache ?: run {
            val text = context.assets.open("words.json").bufferedReader().use { it.readText() }
            val arr = Json.parseToJsonElement(text).jsonArray
            arr.mapIndexed { i, e -> val a = e.jsonArray; Word(i, a[0].jsonPrimitive.content, a[1].jsonPrimitive.content, a[2].jsonPrimitive.content, a[3].jsonPrimitive.content, a[4].jsonPrimitive.content) }
                .also { cache = it }
        }
    }

    /** Регулярное выражение для поиска слова в примере с учётом окончаний; у фразовых глаголов — окончание у первого слова. */
    fun wordRegex(word: String): Regex {
        val parts = word.split(" ").map { Regex.escape(it) }
        val raw = word.split(" ")[0]
        var stem = parts[0]
        if (Regex("[^aeiou]y$", RegexOption.IGNORE_CASE).containsMatchIn(raw)) stem = Regex.escape(raw.dropLast(1)) + "(y|ie|i)"
        else if (raw.endsWith("e", true)) stem = Regex.escape(raw.dropLast(1)) + "e?"
        val first = "$stem(s|es|ed|d|ing|er|est)?"
        return Regex("\\b" + (listOf(first) + parts.drop(1)).joinToString("\\s+") + "\\b", RegexOption.IGNORE_CASE)
    }
}
