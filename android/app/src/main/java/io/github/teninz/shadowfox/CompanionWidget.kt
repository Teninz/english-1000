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

class CompanionWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) { refreshAll(context) }
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            FEED, PET -> {
                try {
                    val result = CompanionStore.act(context, if (intent.action == FEED) "feed" else "pet")
                    refreshAll(context, result.getString("message"))
                } catch (_: Exception) { refreshAll(context, "Не удалось сохранить действие. Открой приложение.") }
            }
            Intent.ACTION_DATE_CHANGED, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED, Intent.ACTION_BOOT_COMPLETED -> refreshAll(context)
        }
    }
    companion object {
        const val FEED = "io.github.teninz.shadowfox.FOX_FEED"
        const val PET = "io.github.teninz.shadowfox.FOX_PET"
        @JvmStatic @JvmOverloads fun refreshAll(context: Context, response: String? = null) {
            val manager = AppWidgetManager.getInstance(context)
            for (id in manager.getAppWidgetIds(ComponentName(context, CompanionWidget::class.java))) {
                try {
                    val state = CompanionStore.read(context)
                    val mood = CompanionStore.mood(state)
                    val treats = CompanionStore.treats(state)
                    val v = RemoteViews(context.packageName, R.layout.companion_widget)
                    val light = context.getSharedPreferences(WordWidget.PREFS, Context.MODE_PRIVATE).getString("theme", "dark") == "light"
                    v.setInt(R.id.fox_root,"setBackgroundResource",if(light) R.drawable.widget_bg_light else R.drawable.widget_bg)
                    v.setTextColor(R.id.fox_title,Color.parseColor(if(light) "#1E2229" else "#F1ECE3"))
                    v.setTextColor(R.id.fox_message,Color.parseColor(if(light) "#5B616C" else "#B9BFCA"))
                    v.setImageViewResource(R.id.fox_image, intArrayOf(R.drawable.companion_idle,R.drawable.companion_sad_1,R.drawable.companion_sad_2,R.drawable.companion_withdrawn)[mood])
                    v.setContentDescription(R.id.fox_image, "Лиса: " + CompanionStore.title(mood))
                    v.setTextViewText(R.id.fox_title, CompanionStore.title(mood))
                    v.setTextViewText(R.id.fox_message, response ?: CompanionStore.message(state))
                    v.setTextViewText(R.id.fox_feed,"Угостить · $treats")
                    v.setBoolean(R.id.fox_feed,"setEnabled",mood < 3 && treats > 0)
                    v.setBoolean(R.id.fox_pet,"setEnabled",mood < 3)
                    v.setTextColor(R.id.fox_feed, Color.parseColor(if(mood == 3 || treats == 0) "#7A7E85" else "#F4B070"))
                    v.setTextColor(R.id.fox_pet, Color.parseColor(if(mood == 3) "#7A7E85" else "#F4B070"))
                    fun action(name: String, code: Int) = PendingIntent.getBroadcast(context,id*10+code,Intent(context,CompanionWidget::class.java).setAction(name),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                    v.setOnClickPendingIntent(R.id.fox_feed,action(FEED,4))
                    v.setOnClickPendingIntent(R.id.fox_pet,action(PET,5))
                    val open=Intent(Intent.ACTION_VIEW,Uri.parse("shadowfox://open?screen=journey")).setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    v.setOnClickPendingIntent(R.id.fox_lesson,PendingIntent.getActivity(context,id*10+6,open,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
                    val home=Intent(Intent.ACTION_VIEW,Uri.parse("shadowfox://open?screen=companion")).setPackage(context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    v.setOnClickPendingIntent(R.id.fox_image,PendingIntent.getActivity(context,id*10+7,home,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
                    manager.updateAppWidget(id,v)
                } catch (_: Exception) {
                    val v=RemoteViews(context.packageName,R.layout.companion_widget)
                    v.setTextViewText(R.id.fox_message,"Открой приложение, чтобы встретиться с лисой.")
                    manager.updateAppWidget(id,v)
                }
            }
        }
    }
}
