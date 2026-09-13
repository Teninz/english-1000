package io.github.teninz.shadowfox;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Мост из веб-части в виджет: приложение передаёт очередь слов на повторение и тему. */
@CapacitorPlugin(name = "Widget")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(WordWidget.PREFS, Context.MODE_PRIVATE);
        prefs.edit()
            .putString("words", call.getString("words", "[]"))
            .putString("kind", call.getString("kind", "due"))
            .putInt("total", call.getInt("total", 0))
            .putString("theme", call.getString("theme", "dark"))
            .putLong("updated", System.currentTimeMillis())
            .apply();
        WordWidget.refreshAll(getContext());
        call.resolve();
    }
}
