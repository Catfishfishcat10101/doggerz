import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const GOOGLE_TEST_REWARDED_ANDROID_ID =
  "ca-app-pub-3940256099942544/5224354917";

function getRewardedAdUnitId() {
  const configured = String(
    import.meta.env?.VITE_ADMOB_REWARDED_ANDROID_ID || ""
  ).trim();
  return configured || GOOGLE_TEST_REWARDED_ANDROID_ID;
}

export async function showRewardedAd() {
  if (Capacitor.getPlatform() === "web") {
    console.log("[AdManager] Web dev mode: Mocking successful ad view.");
    return true;
  }

  try {
    await AdMob.prepareRewardVideoAd({
      adId: getRewardedAdUnitId(),
      isTesting: true,
    });

    const rewardItem = await AdMob.showRewardVideoAd();
    console.log("[AdManager] User earned reward!", rewardItem);
    return true;
  } catch (error) {
    console.error("[AdManager] Ad failed to load or show:", error);
    return false;
  }
}
