package io.github.teninz.shadowfox;

import android.os.SystemClock;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Монотонное время с момента загрузки Android для устойчивого к фону блиц-таймера. */
@CapacitorPlugin(name = "Clock")
public class ClockPlugin extends Plugin {
    @PluginMethod
    public void now(PluginCall call) {
        JSObject result = new JSObject();
        result.put("elapsedRealtime", SystemClock.elapsedRealtime());
        call.resolve(result);
    }
}
