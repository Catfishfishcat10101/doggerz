# Doggerz app ProGuard / R8 rules.
#
# Release minification is currently disabled, but these rules keep the Android
# project ready for production hardening without breaking billing/share flows.

-keep class com.revenuecat.purchases.** { *; }
-keep class com.revenuecat.purchases.hybridcommon.** { *; }
-keep class com.revenuecat.purchases.capacitor.** { *; }
-keep class com.android.billingclient.api.** { *; }
-dontwarn com.android.billingclient.**

# Capacitor plugins rely on reflection for bridge registration and callbacks.
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin

# Keep annotations that some Android libraries inspect at runtime.
-keepattributes *Annotation*