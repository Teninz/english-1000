package io.github.teninz.shadowfox

import android.content.Context
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/** Единое состояние для всех виджетов и WebView. Виджету не нужен запущенный экран. */
object CompanionStore {
    private const val PREFS = "fox_companion"
    fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).format(Date())
    private fun dateEpoch(day: String): Long? = try {
        if (!day.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) null else {
            val f = SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).apply { isLenient = false; timeZone = TimeZone.getTimeZone("UTC") }
            f.parse(day)?.time
        }
    } catch (_: Exception) { null }
    fun empty() = JSONObject().put("completed", JSONObject()).put("fed", 0).put("pets", 0).put("lastAction", JSONObject.NULL)
    @Synchronized fun read(context: Context): JSONObject {
        val text = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("state", null)
        return if (text == null) empty() else JSONObject(text)
    }
    private fun write(context: Context, state: JSONObject) {
        check(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("state", state.toString()).commit()) { "Не удалось сохранить лису" }
    }
    @Synchronized fun reset(context: Context) { write(context, empty()) }
    @Synchronized fun merge(context: Context, incoming: JSONObject): JSONObject {
        val state = read(context)
        val completed = state.getJSONObject("completed")
        val dates = incoming.optJSONObject("completed") ?: JSONObject()
        for (key in dates.keys()) if (dateEpoch(key) != null && dates.optInt(key) == 1) completed.put(key, 1)
        // Действия приложения и виджета сериализованы; старый снимок не отменяет кормление.
        state.put("fed", maxOf(state.optInt("fed"), incoming.optInt("fed")).coerceAtLeast(0))
        state.put("pets", maxOf(state.optInt("pets"), incoming.optInt("pets")).coerceAtLeast(0))
        write(context, state)
        return state
    }
    fun mood(state: JSONObject, day: String = today()): Int {
        val last = state.getJSONObject("completed").keys().asSequence().filter { it <= day && dateEpoch(it) != null }.maxOrNull() ?: return 0
        val diff = ((dateEpoch(day)!! - dateEpoch(last)!!) / 86400000L).toInt()
        return (diff - 1).coerceIn(0, 3)
    }
    fun treats(state: JSONObject): Int = (2 + state.getJSONObject("completed").length() - state.optInt("fed")).coerceAtLeast(0)
    fun title(mood: Int) = arrayOf("Рада тебя видеть", "Притихла", "Скучает по тебе", "Свернулась клубком")[mood]
    fun message(state: JSONObject): String = when (mood(state)) {
        1 -> "Один день без урока. Лиса ждёт вашей встречи."
        2 -> "Два дня без урока. Лиса едва шевелит ушами."
        3 -> "Три дня без урока. Начните занятие, чтобы лиса оживилась."
        else -> if (state.getJSONObject("completed").has(today())) "Сегодня вы уже позанимались. Лиса довольна!" else "Пять слов вместе? За занятие получишь угощение."
    }
    @Synchronized fun act(context: Context, action: String): JSONObject {
        val state = read(context)
        val mood = mood(state)
        var message: String
        if (mood == 3) message = "Лиса пока не реагирует. Короткое занятие поможет ей оживиться."
        else if (action == "feed" && treats(state) == 0) message = "Угощение ждёт за первое занятие дня."
        else {
            require(action == "feed" || action == "pet")
            val key = if (action == "feed") "fed" else "pets"
            state.put(key, state.optInt(key) + 1)
            state.put("lastAction", JSONObject().put("day", today()).put("kind", action))
            message = when (mood) {
                2 -> "Лиса чуть шевельнула ушами. Она скучает по вашим занятиям."
                1 -> "Лиса тихо прижалась к тебе. Может, позанимаемся?"
                else -> if (action == "feed") "Хрум! Лиса довольно облизывается." else "Лиса подставила голову и замахала хвостом."
            }
            write(context, state)
        }
        return JSONObject().put("state", state).put("message", message)
    }
}
