package io.github.teninz.shadowfox;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Мост режима «В дороге»: JS запускает/обновляет/останавливает сервис и получает команды с плеера и наушников. */
@CapacitorPlugin(name = "Road")
public class RoadPlugin extends Plugin {
    static RoadPlugin instance;

    @Override public void load() { instance = this; }

    @PluginMethod public void start(PluginCall call) { boolean ok = RoadService.Companion.start(getContext(), call.getString("word", "ShadowFox Eng"), call.getString("ru", "Режим «В дороге»")); JSObject o = new JSObject(); o.put("ok", ok); call.resolve(o); }
    @PluginMethod public void update(PluginCall call) { RoadService.Companion.update(getContext(), call.getString("word", ""), call.getString("ru", ""), Boolean.TRUE.equals(call.getBoolean("paused", false))); call.resolve(); }
    @PluginMethod public void stop(PluginCall call) { RoadService.Companion.stop(getContext()); call.resolve(); }

    void emitCommand(String cmd) { JSObject o = new JSObject(); o.put("cmd", cmd); notifyListeners("command", o, true); }
}
