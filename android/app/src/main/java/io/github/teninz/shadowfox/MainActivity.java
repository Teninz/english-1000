package io.github.teninz.shadowfox;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetPlugin.class);
        registerPlugin(RoadPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
