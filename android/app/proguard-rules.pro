# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Doggerz billing/share safety:
# release minification is currently disabled, so these are a future-proof no-op.
-keep class com.revenuecat.purchases.** { *; }
-keep class com.revenuecat.purchases.hybridcommon.** { *; }
-keep class com.revenuecat.purchases.capacitor.** { *; }
-keep class com.android.billingclient.api.** { *; }
-dontwarn com.android.billingclient.**
