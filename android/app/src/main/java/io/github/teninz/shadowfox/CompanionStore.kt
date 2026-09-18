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
    private fun identityEmpty() = JSONObject().put("sex", "female").put("name", "").put("decline", true)
        .put("forms", JSONObject().put("nom", "").put("gen", "").put("dat", "").put("acc", "").put("ins", "").put("prep", ""))
    private fun cleanText(value: String) = value.trim().replace(Regex("\\s+"), " ").take(32)
    private fun cleanIdentity(value: JSONObject?): JSONObject {
        if (value == null) return identityEmpty()
        val result = identityEmpty().put("sex", if (value.optString("sex") == "male") "male" else "female")
            .put("name", cleanText(value.optString("name"))).put("decline", value.optBoolean("decline", true))
        val source = value.optJSONObject("forms") ?: JSONObject()
        val forms = result.getJSONObject("forms")
        for (key in arrayOf("nom", "gen", "dat", "acc", "ins", "prep")) forms.put(key, cleanText(source.optString(key)))
        return result
    }
    fun empty() = JSONObject().put("completed", JSONObject()).put("fed", 0).put("watered", 0).put("pets", 0)
        .put("lastFed", JSONObject.NULL).put("lastWater", JSONObject.NULL).put("lastAction", JSONObject.NULL).put("identity", identityEmpty())
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
        state.put("watered", maxOf(state.optInt("watered"), incoming.optInt("watered")).coerceAtLeast(0))
        state.put("pets", maxOf(state.optInt("pets"), incoming.optInt("pets")).coerceAtLeast(0))
        if (incoming.has("identity")) state.put("identity", cleanIdentity(incoming.optJSONObject("identity")))
        else if (!state.has("identity")) state.put("identity", identityEmpty())
        // Выбранная лиса v2 и дата встречи: хранилище их не трактует, но не должно терять.
        for (key in arrayOf("fox", "adopted")) {
            val value = (incoming.opt(key) as? String)?.takeIf { it.isNotEmpty() && it.length <= 32 }
            if (value != null) state.put(key, value) else if (!state.has(key)) state.put(key, JSONObject.NULL)
        }
        for (key in arrayOf("lastFed", "lastWater")) {
            val current = state.optString(key, "").takeIf { dateEpoch(it) != null }
            val candidate = incoming.optString(key, "").takeIf { dateEpoch(it) != null }
            if (candidate != null && (current == null || candidate > current)) state.put(key, candidate)
            else if (!state.has(key)) state.put(key, JSONObject.NULL)
        }
        write(context, state)
        return state
    }
    fun mood(state: JSONObject, day: String = today()): Int {
        val last = state.getJSONObject("completed").keys().asSequence().filter { it <= day && dateEpoch(it) != null }.maxOrNull() ?: return 0
        val diff = ((dateEpoch(day)!! - dateEpoch(last)!!) / 86400000L).toInt()
        return (diff - 1).coerceIn(0, 3)
    }
    fun treats(state: JSONObject): Int = (2 + state.getJSONObject("completed").length() - state.optInt("fed")).coerceAtLeast(0)
    private fun male(state: JSONObject) = state.optJSONObject("identity")?.optString("sex") == "male"
    private fun who(state: JSONObject): String {
        val name = cleanText(state.optJSONObject("identity")?.optString("name") ?: "")
        return name.ifEmpty { if (male(state)) "Лис" else "Лиса" }
    }
    fun title(state: JSONObject, mood: Int): String {
        val male = male(state)
        return when (mood) {
            0 -> "${who(state)} ${if (male) "рад" else "рада"} тебя видеть"
            1 -> "${who(state)} ${if (male) "загрустил" else "загрустила"}"
            2 -> "${who(state)} скучает по тебе"
            else -> "${who(state)} ${if (male) "обиделся" else "обиделась"}"
        }
    }
    fun message(state: JSONObject): String = when (mood(state)) {
        1 -> "Один день без урока. ${who(state)} ждёт вашей встречи."
        2 -> "Два дня без урока. ${who(state)} совсем ${if (male(state)) "приуныл" else "приуныла"}."
        3 -> "Три дня без урока. ${who(state)} сидит спиной — только занятие вернёт ${if (male(state)) "его" else "её"}."
        else -> if (state.getJSONObject("completed").has(today())) "Сегодня вы уже позанимались. ${who(state)} довол${if (male(state)) "ен" else "ьна"}!" else "Пять слов вместе? Короткое занятие — и ${who(state)} ${if (male(state)) "рад" else "рада"}."
    }
    fun sleepTitle(state: JSONObject): String = "${who(state)} сладко спит"
    fun sleepMessage(state: JSONObject): String = "Ночью ${who(state)} спит и видит сны про новые слова. Утром проснётся ${if (male(state)) "сам" else "сама"}."
    @Synchronized fun act(context: Context, action: String): JSONObject {
        val state = read(context)
        val mood = mood(state)
        var message: String
        if (mood == 3) message = "${who(state)} пока не реагирует. Короткое занятие поможет снова оживиться."
        else if (action == "feed" && treats(state) == 0) message = "Угощение ждёт за первое занятие дня."
        else {
            require(action == "feed" || action == "water" || action == "pet")
            val key = when (action) { "feed" -> "fed"; "water" -> "watered"; else -> "pets" }
            state.put(key, state.optInt(key) + 1)
            if (action == "feed") state.put("lastFed", today())
            if (action == "water") state.put("lastWater", today())
            state.put("lastAction", JSONObject().put("day", today()).put("kind", action))
            message = when (mood) {
                2 -> "${who(state)} чуть шевельнул${if (male(state)) "" else "а"} ушами. ${if (male(state)) "Он" else "Она"} скучает по вашим занятиям."
                1 -> "${who(state)} тихо прижал${if (male(state)) "ся" else "ась"} к тебе. Может, позанимаемся?"
                else -> when (action) {
                    "feed" -> "Хрум! ${who(state)} довольно облизывается."
                    "water" -> "${who(state)} напил${if (male(state)) "ся" else "ась"} и довольно встряхнул${if (male(state)) "" else "а"} ушами."
                    else -> "${who(state)} подставил${if (male(state)) "" else "а"} голову и замахал${if (male(state)) "" else "а"} хвостом."
                }
            }
            write(context, state)
        }
        return JSONObject().put("state", state).put("message", message)
    }
}
