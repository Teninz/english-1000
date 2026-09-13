package io.github.teninz.shadowfox

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONArray
import java.util.Calendar

/**
 * Виджет «Слово дня». Словарь берётся из веб-части (assets/public/widget-words.json),
 * слово выбирается по дате; «другое слово» сдвигает выбор на день вперёд для данного экземпляра.
 * Тап по слову открывает приложение на карточке этого слова.
 */
class WordWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) update(context, manager, id)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_NEXT) {
            val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1)
            if (id != -1) {
                val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                prefs.edit().putInt("shift_$id", prefs.getInt("shift_$id", 0) + 1).apply()
                update(context, AppWidgetManager.getInstance(context), id)
            }
        }
    }

    override fun onDeleted(context: Context, ids: IntArray) {
        val e = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
        for (id in ids) e.remove("shift_$id")
        e.apply()
    }

    private fun update(context: Context, manager: AppWidgetManager, id: Int) {
        val words = loadWords(context) ?: return
        val shift = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("shift_$id", 0)
        val day = Calendar.getInstance().get(Calendar.DAY_OF_YEAR) + Calendar.getInstance().get(Calendar.YEAR) * 366
        // перемешиваем детерминированно: соседние дни дают слова из разных уровней
        val index = ((day + shift) * 37L % words.length()).toInt()
        val w = words.getJSONArray(index)

        val views = RemoteViews(context.packageName, R.layout.word_widget)
        views.setTextViewText(R.id.widget_eyebrow, "СЛОВО ДНЯ · УРОВЕНЬ ${w.getInt(4)}")
        views.setTextViewText(R.id.widget_word, w.getString(0))
        views.setTextViewText(R.id.widget_ru, w.getString(1))
        views.setTextViewText(R.id.widget_ex, w.getString(2))

        // тап по виджету — открыть карточку слова в приложении
        val open = Intent(Intent.ACTION_VIEW, Uri.parse("shadowfox://open?word=" + Uri.encode(w.getString(0))))
            .setPackage(context.packageName)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(context, id, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        // «другое слово»
        val next = Intent(context, WordWidget::class.java).setAction(ACTION_NEXT).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
        views.setOnClickPendingIntent(R.id.widget_next, PendingIntent.getBroadcast(context, id, next, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        manager.updateAppWidget(id, views)
    }

    private fun loadWords(context: Context): JSONArray? = try {
        context.assets.open("public/widget-words.json").bufferedReader().use { JSONArray(it.readText()) }
    } catch (e: Exception) { null }

    companion object {
        const val ACTION_NEXT = "io.github.teninz.shadowfox.WIDGET_NEXT"
        const val PREFS = "word_widget"
    }
}
