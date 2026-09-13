package io.github.teninz.shadowfox

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONArray
import java.util.Calendar

/**
 * Виджет «Слово для повторения».
 * Очередь слов приходит из приложения (WidgetPlugin → SharedPreferences): сначала слова на повторение,
 * если их нет — новые слова текущего уровня; пока приложение ни разу не запускалось — слово дня из словаря.
 * ▶ справа озвучивает слово и перевод, «далее» листает очередь, тап по слову открывает его карточку.
 */
class WordWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) safeRender(context, manager, id)
    }

    /** Любая ошибка отрисовки не должна ронять приложение: покажем хотя бы заглушку. */
    private fun safeRender(context: Context, manager: AppWidgetManager, id: Int) {
        try { render(context, manager, id) } catch (e: Exception) {
            try {
                val v = RemoteViews(context.packageName, R.layout.word_widget)
                v.setTextViewText(R.id.widget_word, "ShadowFox Eng"); v.setTextViewText(R.id.widget_ru, "Открой приложение"); v.setTextViewText(R.id.widget_ex, "")
                manager.updateAppWidget(id, v)
            } catch (_: Exception) {}
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_NEXT) {
            val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1)
            if (id != -1) {
                val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                prefs.edit().putInt("pos_$id", prefs.getInt("pos_$id", 0) + 1).apply()
                safeRender(context, AppWidgetManager.getInstance(context), id)
            }
        }
    }

    override fun onDeleted(context: Context, ids: IntArray) {
        val e = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
        for (id in ids) e.remove("pos_$id")
        e.apply()
    }

    private fun render(context: Context, manager: AppWidgetManager, id: Int) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val light = prefs.getString("theme", "dark") == "light"
        var kind = prefs.getString("kind", "day") ?: "day"
        var words = try { JSONArray(prefs.getString("words", "[]")) } catch (e: Exception) { JSONArray() }
        if (words.length() == 0) { words = loadAll(context) ?: return; kind = "day" }

        val pos = prefs.getInt("pos_$id", 0)
        val index = if (kind == "day") {
            val day = Calendar.getInstance().get(Calendar.DAY_OF_YEAR) + Calendar.getInstance().get(Calendar.YEAR) * 366
            ((day + pos) * 37L % words.length()).toInt()
        } else pos % words.length()
        val w = words.getJSONArray(index)
        val total = prefs.getInt("total", 0)

        val eyebrow = when (kind) {
            "due" -> "ПОВТОРИТЬ · ${plural(total, "СЛОВО", "СЛОВА", "СЛОВ")}"
            "new" -> "НОВОЕ СЛОВО · УРОВЕНЬ ${w.getInt(4)}"
            else -> "СЛОВО ДНЯ · УРОВЕНЬ ${w.getInt(4)}"
        }

        val views = RemoteViews(context.packageName, R.layout.word_widget)
        views.setTextViewText(R.id.widget_eyebrow, eyebrow)
        views.setTextViewText(R.id.widget_word, w.getString(0))
        views.setTextViewText(R.id.widget_ru, w.getString(1))
        views.setTextViewText(R.id.widget_ex, w.getString(2))
        views.setTextViewText(R.id.widget_next, "${index + 1}/${words.length()} · далее")

        // тема
        views.setInt(R.id.widget_root, "setBackgroundResource", if (light) R.drawable.widget_bg_light else R.drawable.widget_bg)
        views.setInt(R.id.widget_divider, "setBackgroundColor", Color.parseColor(if (light) "#D9722E" else "#E8853A"))
        views.setTextColor(R.id.widget_word, Color.parseColor(if (light) "#1E2229" else "#F1ECE3"))
        views.setTextColor(R.id.widget_ru, Color.parseColor(if (light) "#B8781A" else "#EFA537"))
        views.setTextColor(R.id.widget_ex, Color.parseColor(if (light) "#6A6F7A" else "#A3A8B3"))
        views.setTextColor(R.id.widget_eyebrow, Color.parseColor(if (light) "#6A6F7A" else "#A3A8B3"))
        views.setTextColor(R.id.widget_next, Color.parseColor(if (light) "#D9722E" else "#E8853A"))
        views.setImageViewResource(R.id.widget_play, if (light) R.drawable.ic_widget_play_light else R.drawable.ic_widget_play)

        // тап по слову — карточка в приложении
        val open = Intent(Intent.ACTION_VIEW, Uri.parse("shadowfox://open?word=" + Uri.encode(w.getString(0))))
            .setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        views.setOnClickPendingIntent(R.id.widget_text, PendingIntent.getActivity(context, id * 10 + 1, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        // ▶ — озвучить слово и перевод
        val speak = Intent(context, SpeakService::class.java).putExtra("word", w.getString(0)).putExtra("ru", w.getString(1))
        views.setOnClickPendingIntent(R.id.widget_play, PendingIntent.getService(context, id * 10 + 2, speak, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        // далее
        val next = Intent(context, WordWidget::class.java).setAction(ACTION_NEXT).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
        views.setOnClickPendingIntent(R.id.widget_next, PendingIntent.getBroadcast(context, id * 10 + 3, next, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        manager.updateAppWidget(id, views)
    }

    private fun plural(n: Int, one: String, few: String, many: String): String {
        val m10 = n % 10; val m100 = n % 100
        val f = if (m10 == 1 && m100 != 11) one else if (m10 in 2..4 && (m100 < 12 || m100 > 14)) few else many
        return "$n $f"
    }

    private fun loadAll(context: Context): JSONArray? = try {
        context.assets.open("public/widget-words.json").bufferedReader().use { JSONArray(it.readText()) }
    } catch (e: Exception) { null }

    companion object {
        const val ACTION_NEXT = "io.github.teninz.shadowfox.WIDGET_NEXT"
        const val PREFS = "word_widget"

        /** Перерисовать все экземпляры (вызывается из приложения после обновления очереди). */
        @JvmStatic fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, WordWidget::class.java))
            val e = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            for (id in ids) e.putInt("pos_$id", 0)
            e.apply()
            for (id in ids) WordWidget().safeRender(context, manager, id)
        }
    }
}
