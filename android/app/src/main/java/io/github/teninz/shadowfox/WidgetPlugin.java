package io.github.teninz.shadowfox;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

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

    @PluginMethod public void shareProgress(PluginCall call) {
        try {
            String content = call.getString("content", "");
            if (content.length() > 4000000) { call.reject("Файл слишком большой"); return; }
            File file = new File(getContext().getCacheDir(), "ShadowFox-progress.json");
            try (FileOutputStream out = new FileOutputStream(file)) { out.write(content.getBytes(StandardCharsets.UTF_8)); }
            Intent share = new Intent(Intent.ACTION_SEND).setType("application/json")
                .putExtra(Intent.EXTRA_STREAM, FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file))
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().runOnUiThread(() -> { getActivity().startActivity(Intent.createChooser(share, "Сохранить резервную копию")); call.resolve(); });
        } catch (Exception e) { call.reject("Не удалось создать копию", e); }
    }
}
