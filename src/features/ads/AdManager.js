//src/features/ads/AdManager.js
import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const GOOGLE_TEST_REWARDED_ANDROID_ID =
  "ca-app-pub-3940256099942544/5224354917";
const GOOGLE_TEST_REWARDED_IOS_ID = "ca-app-pub-3940256099942544/1712485313";

function getRewardedAdUnitId() {
  const platform = Capacitor.getPlatform();

  if (platform === "ios") {
    const configuredIOS = String(
      import.meta.env?.VITE_ADMOB_REWARDED_IOS_ID || ""
    ).trim();
    return configuredIOS || GOOGLE_TEST_REWARDED_IOS_ID;
  }

  const configuredAndroid = String(
    import.meta.env?.VITE_ADMOB_REWARDED_ANDROID_ID || ""
  ).trim();
  return configuredAndroid || GOOGLE_TEST_REWARDED_ANDROID_ID;
}

async function showRewardedAd() {
  try {
    await AdMob.prepareRewardVideoAd({
      adId: getRewardedAdUnitId(),
      isTesting: import.meta.env?.MODE !== "production",
    });

    const rewardItem = await AdMob.showRewardVideoAd();
    console.log("[AdManager] User earned reward!", rewardItem);
    return true;
  } catch (error) {
    console.error("[AdManager] Ad failed to load or show:", error);
    return false;
  }
}

export { showRewardedAd };
