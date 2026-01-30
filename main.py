from kivy.app import App
from kivy.uix.browser import WebView
from kivy.utils import platform

class DoggerzApp(App):
  def build(self):
    if platform == 'android':
      from android.webkit import WebView
      from android.runnable import run_on_ui_thread

      @run_on_ui_thread
      def create_webview():
        webview = WebView(self.root_window)
        webview.loadUrl("file://android_asset/index.html")

      create_webview()
    return None

if__name__ == '__main__'
DoggerzApp().run()