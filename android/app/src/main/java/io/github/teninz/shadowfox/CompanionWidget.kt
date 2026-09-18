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
import java.util.Calendar

// Виджет «Лиса-компаньон»: картинка по настроению и времени суток, заголовок, подсказка и кнопка «Занятие с лисой».
// Кнопок еды/воды/ласки больше нет — взаимодействие с лисой живёт в приложении (касание).
class CompanionWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) { refreshAll(context) }
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            Intent.ACTION_DATE_CHANGED, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED, Intent.ACTION_BOOT_COMPLETED -> refreshAll(context)
        }
    }
    companion object {
        // Ночь 23:30–07:30 по часам устройства, как в приложении: лиса спит.
        private fun isNight(): Boolean {
            val c = Calendar.getInstance()
            val minutes = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
            return minutes < 450 || minutes >= 1410
        }
        @JvmStatic @JvmOverloads fun refreshAll(context: Context, response: String? = null) {
            val manager = AppWidgetManager.getInstance(context)
            for (id in manager.getAppWidgetIds(ComponentName(context, CompanionWidget::class.java))) {
                try {
                    val state = CompanionStore.read(context)
                    val mood = CompanionStore.mood(state)
                    val night = isNight()
                    val v = RemoteViews(context.packageName, R.layout.companion_widget)
                    val light = context.getSharedPreferences(WordWidget.PREFS, Context.MODE_PRIVATE).getString("theme", "dark") == "light"
                    v.setInt(R.id.fox_root, "setBackgroundResource", if (light) R.drawable.widget_bg_light else R.drawable.widget_bg)
                    v.setTextColor(R.id.fox_title, Color.parseColor(if (light) "#1E2229" else "#F1ECE3"))
                    v.setTextColor(R.id.fox_message, Color.parseColor(if (light) "#5B616C" else "#B9BFCA"))
                    val image = if (night) R.drawable.companion_sleep else intArrayOf(R.drawable.companion_idle, R.drawable.companion_sad_1, R.drawable.companion_sad_2, R.drawable.companion_withdrawn)[mood]
                    v.setImageViewResource(R.id.fox_image, image)
                    val title = if (night) CompanionStore.sleepTitle(state) else CompanionStore.title(state, mood)
                    v.setContentDescription(R.id.fox_image, title)
                    v.setTextViewText(R.id.fox_title, title)
                    v.setTextViewText(R.id.fox_message, response ?: if (night) CompanionStore.sleepMessage(state) else CompanionStore.message(state))
                    val open = Intent(Intent.ACTION_VIEW, Uri.parse("shadowfox://open?screen=journey")).setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    v.setOnClickPendingIntent(R.id.fox_lesson, PendingIntent.getActivity(context, id * 10 + 7, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
                    val home = Intent(Intent.ACTION_VIEW, Uri.parse("shadowfox://open?screen=companion")).setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    v.setOnClickPendingIntent(R.id.fox_image, PendingIntent.getActivity(context, id * 10 + 8, home, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
                    manager.updateAppWidget(id, v)
                } catch (_: Exception) {
                    val v = RemoteViews(context.packageName, R.layout.companion_widget)
                    v.setTextViewText(R.id.fox_message, "Открой приложение, чтобы встретиться с лисой.")
                    manager.updateAppWidget(id, v)
                }
            }
        }
    }
}
