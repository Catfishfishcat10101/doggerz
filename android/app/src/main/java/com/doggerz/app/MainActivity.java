package com.doggerz.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private void applyImmersiveSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowManager.LayoutParams params = getWindow().getAttributes();
            params.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
            getWindow().setAttributes(params);
        }

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller == null) return;

        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyImmersiveSystemBars();
        try {
            Bridge bridge = this.getBridge();
            if (bridge == null) return;

            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    webView.setRendererPriorityPolicy(
                        WebView.RENDERER_PRIORITY_BOUND,
                        true
                    );
                }
            }
        } catch (Exception ignored) {
            // Never crash app startup for optional WebView tuning.
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        applyImmersiveSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyImmersiveSystemBars();
        }
    }
}
