package io.github.teninz.shadowfox;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetPlugin.class);
        registerPlugin(RoadPlugin.class);
        registerPlugin(ClockPlugin.class);
        super.onCreate(savedInstanceState);
        requestHighRefreshRate();
    }

    @Override
    public void onResume() { super.onResume(); requestHighRefreshRate(); }

    /** По умолчанию Android даёт приложению 60 Гц; просим самый быстрый режим дисплея с тем же разрешением (90/120/144 Гц). */
    private void requestHighRefreshRate() {
        try {
            Display display = Build.VERSION.SDK_INT >= 30 ? getDisplay() : getWindowManager().getDefaultDisplay();
            if (display == null) return;
            Display.Mode current = display.getMode();
            Display.Mode best = current;
            for (Display.Mode m : display.getSupportedModes()) {
                if (m.getPhysicalWidth() == current.getPhysicalWidth() && m.getPhysicalHeight() == current.getPhysicalHeight() && m.getRefreshRate() > best.getRefreshRate()) best = m;
            }
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.preferredDisplayModeId = best.getModeId();
            if (Build.VERSION.SDK_INT >= 30) lp.preferredRefreshRate = best.getRefreshRate();
            getWindow().setAttributes(lp);
        } catch (Exception ignored) {}
    }
}
