import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "doggerz:native:dogState:v1";

export async function loadDogState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("[nativeStorage] Failed to load dog state:", error);
    return null;
  }
}

export async function saveDogState(dogState) {
  try {
    if (!dogState || typeof dogState !== "object") return false;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dogState));
    return true;
  } catch (error) {
    console.warn("[nativeStorage] Failed to save dog state:", error);
    return false;
  }
}
