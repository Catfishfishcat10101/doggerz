// src/pages/Settings.jsx
/** @format */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { useDispatch } from "react-redux";
import { useDogVacation } from "@/hooks/useDogState.js";
import { PATHS } from "@/app/routes.js";
import {
  useUserActions,
  useUserSettingsView,
} from "@/hooks/useUserSettings.js";
import {
  resetDogState,
  getDogStorageKey,
  setVacationMode,
} from "../store/dogSlice.js";
import { USER_STORAGE_KEY } from "../store/userSlice.js";
import { auth, firebaseReady } from "../lib/firebase/index.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  hydrateSettings,
  resetSettings,
  setAudioEnabled,
  setConfirmDangerousActions,
  setFontScale,
  setFocusRings,
  setHighContrast,
  setHitTargets,
  setMasterVolume,
  setMusicEnabled,
  setMusicVolume,
  setBatterySaver,
  setPerfMode,
  setReduceMotion,
  setReduceTransparency,
  setSleepAudioEnabled,
  setSleepVolume,
  setTrainingInputMode,
  setShowGameMicroHud,
  setShowCritters,
  setRoamIntensity,
  setShowWeatherFx,
  setUsePreciseDayNightLocation,
  setShowBackgroundPhotos,
  setShowSceneVignette,
  setShowSceneGrain,
  setSfxVolume,
  setShowHints,
  setDailyRemindersEnabled,
  setTheme,
  setHapticsEnabled,
  setStoreHoverPreview,
  setStoreShowEquippedFirst,
  setStoreCompactCards,
  setStoreSortKey,
  setPottyAutoReturn,
  setPottyConfirmAccidents,
  setPottyShowXpTools,
  setPottyTipsExpanded,
  setDreamJournalKind,
  setDreamJournalSort,
  setDreamJournalShowMotifs,
  setDreamJournalShowSummary,
  setDreamJournalShowTimestamp,
  setDreamJournalCompactCards,
  setDreamSequenceShowMotifs,
  setDreamSequenceShowTip,
  setDreamSequenceAutoDismiss,
  setDreamSequenceBackdropFx,
  setFaqCompactView,
  setBadgesGroupFilter,
  setBadgesCompactChips,
  setBadgesShowIds,
  setSkillTreeBranch,
  setSkillTreeShowUnlockedOnly,
  setSkillTreeCompactCards,
  setTopBarCompact,
  setTopBarShowXp,
  setTopBarShowStats,
  setTopBarShowBadges,
  setTopBarShowQuickLinks,
  setMechanicsCompact,
  setMechanicsShowTips,
  setMechanicsShowStats,
  setMechanicsShowUnlockLine,
  setTraitImpactCompact,
  setTraitImpactShowMeter,
  setTraitImpactShowTips,
  setTraitImpactShowHighlights,
  setDogCanvasMotion,
  setDogCanvasShadow,
  setDogCanvasScale,
  setDogPixiMotion,
  setDogPixiScale,
  setDogPixiQuality,
  setSpriteSheetMotion,
  setSpriteSheetUsePixelated,
  setSpriteSheetSize,
  setPixiDogMotion,
  setPixiDogShowHearts,
  setPixiDogShowShadow,
  setPixiDogQuality,
  setGameFxSkillPulse,
  setGameFxStoryGlow,
  setGameFxBranchAccent,
  setCosmeticsOverlayShowLabels,
  setCosmeticsOverlayShowPreviewTags,
  setCosmeticsOverlayPosition,
  setTrainingShowLocked,
  setTrainingCompactCards,
  setTrainingShowDetails,
  setTrainingSortKey,
  SETTINGS_STORAGE_KEY,
} from "../store/settingsSlice.js";
import PageShell from "../components/layout/PageShell.jsx";
import { PageHeader } from "@/components/layout/PageSections.jsx";
import { APP_VERSION } from "../utils/assetUtils.js";
import { useToast } from "@/state/toastContext.js";
import {
  getStoredValue,
  listStoredKeys,
  removeStoredValue,
  removeStoredValues,
  setStoredValue,
} from "@/utils/nativeStorage.js";
import DataDeletion from "@/features/settings/DataDeletion.jsx";
import {
  canUseNotifications,
  getNotificationPermission,
  requestNotificationsPermission,
  showDoggerzNotification,
} from "../utils/notifications.js";
import {
  getLastReminder,
  loadReminderStateAsync,
  REMINDER_EVENT,
} from "../utils/reminders.js";

function pct(n) {
  const v = Math.round(Number(n) * 100);
  return Number.isFinite(v) ? v : 0;
}

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function Switch({ id, checked, onChange, label, description }) {
  const tooltip = description || label;
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-black/15 px-3 py-3">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-doggerz-bone"
          title={tooltip}
        >
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs text-doggerz-paw/70">{description}</p>
        ) : null}
      </div>

      <div className="shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only dz-native-toggle-input"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
          title={tooltip}
        />
        <label
          htmlFor={id}
          title={tooltip}
          className="dz-native-toggle relative inline-flex h-7 w-[52px] cursor-pointer items-center rounded-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-doggerz-leaf/80 peer-focus-visible:outline-offset-2"
        >
          <span className="sr-only">{label}</span>
          <span className="dz-native-toggle__thumb inline-block h-5 w-5 rounded-full bg-white shadow transition" />
        </label>
      </div>
    </div>
  );
}

function SelectRow({ id, label, description = "", value, onChange, options }) {
  const tooltip = description || label;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-doggerz-bone"
          title={tooltip}
        >
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs text-doggerz-paw/70">{description}</p>
        ) : null}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={tooltip}
        className="w-full sm:w-56 rounded-xl border border-doggerz-mange/55 bg-black/30 px-3 py-2 text-sm text-doggerz-bone focus:border-doggerz-leaf/70 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderRow({
  id,
  label,
  description = "",
  value,
  onChange,
  min,
  max,
  step,
  rightLabel,
}) {
  const tooltip = description || label;
  const pct =
    Number(max) > Number(min)
      ? Math.max(
          0,
          Math.min(
            100,
            ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100
          )
        )
      : 0;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-black/15 px-3 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="text-sm font-semibold text-doggerz-bone"
            title={tooltip}
          >
            {label}
          </label>
          {description ? (
            <p className="mt-1 text-xs text-doggerz-paw/70">{description}</p>
          ) : null}
        </div>
        {rightLabel ? (
          <div className="shrink-0 text-xs text-doggerz-paw/70">
            {rightLabel}
          </div>
        ) : null}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        title={tooltip}
        className="dz-native-slider w-full"
        style={{
          background: `linear-gradient(90deg, var(--energy-color) 0%, var(--energy-color) ${pct}%, var(--bar-bg) ${pct}%, var(--bar-bg) 100%)`,
        }}
      />
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-doggerz-mange/45 bg-black/45 p-5 shadow-lg shadow-black/25 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-doggerz-bone">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-doggerz-paw/70">{subtitle}</p>
        ) : null}
      </div>
      <div className={`space-y-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const { settings, currentZip, dogRenderMode } = useUserSettingsView();
  const { setDogRenderMode, setZip } = useUserActions();
  const vacation = /** @type {any} */ (useDogVacation());
  const toast = useToast();

  const [zipInput, setZipInput] = useState(currentZip || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setZipInput(currentZip || "");
  }, [currentZip]);

  const zipIsValid = zipInput === "" || /^\d{5}$/.test(zipInput);
  const preciseDayNightLocationEnabled =
    settings?.usePreciseDayNightLocation === true;

  const [cloudUser, setCloudUser] = useState(() => auth?.currentUser ?? null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudActionStatus, setCloudActionStatus] = useState("");
  const [localActionStatus, setLocalActionStatus] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(() => {
    return getNotificationPermission();
  });
  const [lastReminder, setLastReminder] = useState(() => getLastReminder());

  const ensureDayNightLocationAccess = async () => {
    const current = await Geolocation.checkPermissions().catch(() => null);
    const grantedAlready =
      current?.coarseLocation === "granted" || current?.location === "granted";

    if (!grantedAlready && Capacitor.isNativePlatform()) {
      const requested = await Geolocation.requestPermissions({
        permissions: ["coarseLocation"],
      });
      const granted =
        requested?.coarseLocation === "granted" ||
        requested?.location === "granted";
      if (!granted) return false;
    }

    await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    });

    return true;
  };

  const handlePreciseDayNightLocationToggle = async (enabled) => {
    if (!enabled) {
      dispatch(setUsePreciseDayNightLocation(false));
      toast.info("Using ZIP or local clock for day/night timing.");
      return;
    }

    try {
      const granted = await ensureDayNightLocationAccess();
      if (!granted) {
        dispatch(setUsePreciseDayNightLocation(false));
        toast.warn("Location permission not granted. ZIP timing stays active.");
        return;
      }

      dispatch(setUsePreciseDayNightLocation(true));
      toast.success("Precise sunrise/sunset timing enabled.");
    } catch {
      dispatch(setUsePreciseDayNightLocation(false));
      toast.warn("Location unavailable. Falling back to ZIP timing.");
    }
  };

  useEffect(() => {
    const update = () => {
      setNotificationPermission(getNotificationPermission());
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadReminderStateAsync().then((state) => {
      if (cancelled) return;
      setLastReminder(state?.lastReminder || null);
    });

    const onReminder = (event) => {
      const next = event?.detail || getLastReminder();
      setLastReminder(next || null);
    };
    window.addEventListener(REMINDER_EVENT, onReminder);
    return () => {
      cancelled = true;
      window.removeEventListener(REMINDER_EVENT, onReminder);
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      setCloudUser(null);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setCloudUser(u || null);
    });

    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, []);

  async function handleSignOut() {
    if (!auth) return;
    setCloudBusy(true);
    setCloudActionStatus("");
    try {
      await signOut(auth);
      setCloudActionStatus("Signed out.");
    } catch (e) {
      console.error(e);
      setCloudActionStatus("Sign out failed. See console.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function exportLocalData() {
    try {
      const dogKey = getDogStorageKey(auth?.currentUser?.uid || null);
      const [dogRaw, userRaw, settingsRaw] = await Promise.all([
        getStoredValue(dogKey),
        getStoredValue(USER_STORAGE_KEY),
        getStoredValue(SETTINGS_STORAGE_KEY),
      ]);

      const payload = {
        format: "doggerz-export",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          dog: (() => {
            try {
              return dogRaw ? JSON.parse(dogRaw) : null;
            } catch {
              return null;
            }
          })(),
          user: (() => {
            try {
              return userRaw ? JSON.parse(userRaw) : null;
            } catch {
              return null;
            }
          })(),
          settings: (() => {
            try {
              return settingsRaw ? JSON.parse(settingsRaw) : null;
            } catch {
              return null;
            }
          })(),
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doggerz-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setLocalActionStatus("Export completed.");
    } catch (err) {
      console.error(err);
      setLocalActionStatus("Export failed. Check the console for details.");
    }
  }

  async function importLocalData(file) {
    if (!file) return;
    const text = await file.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setLocalActionStatus("That file doesn't look like valid JSON.");
      return;
    }

    const data = parsed?.data;
    if (!data || parsed?.format !== "doggerz-export") {
      setLocalActionStatus("That file doesn't look like a Doggerz export.");
      return;
    }

    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm(
        "Importing will overwrite your local Doggerz save + settings on this device. Continue?"
      );
      if (!ok) return;
    }

    try {
      const dogKey = getDogStorageKey(auth?.currentUser?.uid || null);
      if (data.dog) {
        await setStoredValue(dogKey, JSON.stringify(data.dog));
      }
      if (data.user) {
        await setStoredValue(USER_STORAGE_KEY, JSON.stringify(data.user));
      }
      if (data.settings) {
        await setStoredValue(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(data.settings)
        );
        dispatch(hydrateSettings(data.settings));
      }

      setLocalActionStatus("Import successful. Reloading…");
      window.location.reload();
    } catch (e) {
      console.error(e);
      setLocalActionStatus("Import failed. Check the console for details.");
    }
  }

  async function clearLocalStorageAll() {
    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm(
        "This clears ALL local Doggerz data on this device (save + settings). Cloud data (if any) is not deleted. Continue?"
      );
      if (!ok) return;
    }

    try {
      const keys = await listStoredKeys();
      const doggerzKeys = keys.filter((key) =>
        String(key || "").startsWith("doggerz:")
      );
      await removeStoredValues([...doggerzKeys, "theme"]);
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLocalActionStatus("Could not clear storage.");
    }
  }

  async function resetPupLocal() {
    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm(
        "Reset your local pup progress on this device?"
      );
      if (!ok) return;
    }

    try {
      const dogKey = getDogStorageKey(auth?.currentUser?.uid || null);
      await removeStoredValue(dogKey);
    } catch {
      // ignore
    }

    dispatch(resetDogState());
    setLocalActionStatus("Local pup reset.");
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeader>
          <h1 className="text-4xl font-black tracking-tight text-doggerz-bone">
            Settings
          </h1>
          <p className="text-sm text-doggerz-paw/70 max-w-2xl">
            Customize your Doggerz experience on this device. Most settings save
            automatically.
          </p>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Account & cloud"
            subtitle="Optional cloud features (Firebase). Offline play works without an account."
          >
            {!firebaseReady ? (
              <p className="text-sm text-doggerz-paw/70">
                Cloud features are currently disabled because Firebase isn’t
                configured.
              </p>
            ) : cloudUser ? (
              <div className="space-y-3">
                <div className="text-sm text-doggerz-paw">
                  Signed in as{" "}
                  <span className="font-semibold">
                    {cloudUser.email || cloudUser.uid}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={cloudBusy}
                    onClick={handleSignOut}
                    title="Sign out of cloud sync on this device."
                    className="dz-touch-button inline-flex items-center justify-center rounded-xl border border-red-400/45 bg-transparent px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-300 hover:text-red-200 disabled:opacity-60"
                  >
                    Sign out
                  </button>
                </div>

                {cloudActionStatus ? (
                  <p className="text-xs text-doggerz-paw/70">
                    {cloudActionStatus}
                  </p>
                ) : null}

                <DataDeletion />
              </div>
            ) : (
              <p className="text-sm text-doggerz-paw/70">
                You’re not signed in. Visit{" "}
                <Link
                  className="text-doggerz-leaf hover:text-doggerz-neonSoft"
                  to="/login"
                  title="Open login to enable cloud sync features."
                >
                  Login
                </Link>{" "}
                to enable cloud sync.
              </p>
            )}
          </Card>

          <Card title="Appearance" subtitle="Theme and visual comfort settings">
            <SelectRow
              id="theme"
              label="Theme"
              description="Pick a theme, or follow your device setting."
              value={settings?.theme || "system"}
              onChange={(v) => dispatch(setTheme(v))}
              options={[
                { value: "system", label: "System" },
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />

            <SliderRow
              id="fontScale"
              label="Text size"
              description="Scales the entire UI using the browser root font size."
              value={Number(settings?.fontScale ?? 1)}
              onChange={(v) => dispatch(setFontScale(v))}
              min={0.9}
              max={1.15}
              step={0.01}
              rightLabel={`${Math.round((Number(settings?.fontScale ?? 1) || 1) * 100)}%`}
            />

            <Switch
              id="highContrast"
              label="High contrast"
              description="Boost borders + text contrast for readability."
              checked={settings?.highContrast}
              onChange={(v) => dispatch(setHighContrast(v))}
            />

            <Switch
              id="reduceTransparency"
              label="Reduce transparency"
              description="Disables blur effects for clearer text and better performance."
              checked={settings?.reduceTransparency}
              onChange={(v) => dispatch(setReduceTransparency(v))}
            />

            <SelectRow
              id="perfMode"
              label="Performance mode"
              description="Controls automatic reduced effects in the yard (separate from Reduce motion)."
              value={settings?.perfMode || "auto"}
              onChange={(v) => dispatch(setPerfMode(v))}
              options={[
                { value: "auto", label: "Auto (recommended)" },
                { value: "on", label: "On (reduce effects)" },
                { value: "off", label: "Off (full effects)" },
              ]}
            />

            <Switch
              id="batterySaver"
              label="Battery-friendly mode"
              description="Disables heavy visual effects to save battery and reduce heat."
              checked={settings?.batterySaver}
              onChange={(v) => dispatch(setBatterySaver(v))}
            />
          </Card>

          <Card
            title="Accessibility"
            subtitle="Motion, focus, and touch targets"
          >
            <SelectRow
              id="reduceMotion"
              label="Reduce motion"
              description="Overrides system preference if you want."
              value={settings?.reduceMotion || "system"}
              onChange={(v) => dispatch(setReduceMotion(v))}
              options={[
                { value: "system", label: "Follow system" },
                { value: "on", label: "On (reduce motion)" },
                { value: "off", label: "Off (allow motion)" },
              ]}
            />

            <SelectRow
              id="focusRings"
              label="Focus rings"
              description="Useful for keyboard navigation and accessibility testing."
              value={settings?.focusRings || "auto"}
              onChange={(v) => dispatch(setFocusRings(v))}
              options={[
                { value: "auto", label: "Auto (focus-visible)" },
                { value: "always", label: "Always show" },
              ]}
            />

            <SelectRow
              id="hitTargets"
              label="Touch target size"
              description="Makes buttons/inputs easier to tap on mobile."
              value={settings?.hitTargets || "auto"}
              onChange={(v) => dispatch(setHitTargets(v))}
              options={[
                { value: "auto", label: "Auto" },
                { value: "large", label: "Large (44px min height)" },
              ]}
            />

            <Switch
              id="showHints"
              label="Show hints"
              description="Show helper tips in places that support it."
              checked={settings?.showHints}
              onChange={(v) => dispatch(setShowHints(v))}
            />
          </Card>

          <Card
            title="Scene & effects"
            subtitle="Control backgrounds, overlays, and weather particles"
            bodyClassName="grid gap-4 sm:grid-cols-2"
          >
            <Switch
              id="showWeatherFx"
              label="Weather effects"
              description="Rain/snow particles in the yard."
              checked={settings?.showWeatherFx !== false}
              onChange={(v) => dispatch(setShowWeatherFx(v))}
            />

            <Switch
              id="showBackgroundPhotos"
              label="Photo backgrounds"
              description="Use the backyard photos behind the gradient."
              checked={settings?.showBackgroundPhotos !== false}
              onChange={(v) => dispatch(setShowBackgroundPhotos(v))}
            />

            <Switch
              id="showSceneVignette"
              label="Vignette overlay"
              description="Adds a soft edge darkening for depth."
              checked={settings?.showSceneVignette !== false}
              onChange={(v) => dispatch(setShowSceneVignette(v))}
            />

            <Switch
              id="showSceneGrain"
              label="Film grain"
              description="Adds subtle texture over the yard."
              checked={settings?.showSceneGrain !== false}
              onChange={(v) => dispatch(setShowSceneGrain(v))}
            />
          </Card>

          <Card title="Game" subtitle="Controls and visuals">
            <SelectRow
              id="dogRenderMode"
              label="Dog render style"
              description="Switch between pixel sprites and realistic assets."
              value={dogRenderMode || "sprite"}
              onChange={setDogRenderMode}
              options={[
                { value: "sprite", label: "Sprite (pixel)" },
                { value: "realistic", label: "Realistic" },
              ]}
            />

            <SelectRow
              id="trainingInputMode"
              label="Training input"
              description="Choose button training, voice training, or both."
              value={settings?.trainingInputMode || "both"}
              onChange={(v) => dispatch(setTrainingInputMode(v))}
              options={[
                { value: "buttons", label: "Buttons only" },
                { value: "voice", label: "Voice only" },
                { value: "both", label: "Buttons + voice" },
              ]}
            />

            <Switch
              id="showGameMicroHud"
              label="Show micro HUD"
              description="Toggles small chips row at the top of the Game screen."
              checked={settings?.showGameMicroHud !== false}
              onChange={(v) => dispatch(setShowGameMicroHud(v))}
            />

            <Switch
              id="vacationMode"
              label="Vacation mode"
              description="Pauses decay and aging while you're away (turn it on before you leave)."
              checked={vacation?.enabled}
              onChange={(v) => dispatch(setVacationMode(v))}
            />

            <Switch
              id="showCritters"
              label="Show critters"
              description="Adds little critters that your pup can notice while wandering."
              checked={settings?.showCritters !== false}
              onChange={(v) => dispatch(setShowCritters(v))}
            />

            <SliderRow
              id="roamIntensity"
              label="Roaming intensity"
              value={Number(settings?.roamIntensity ?? 1)}
              onChange={(v) => dispatch(setRoamIntensity(v))}
              min={0}
              max={1}
              step={0.05}
              rightLabel={`${pct(settings?.roamIntensity ?? 1)}%`}
            />
          </Card>

          <Card
            title="Store & catalog"
            subtitle="How the Store lists and previews items"
          >
            <Switch
              id="storeHoverPreview"
              label="Hover previews"
              description="Show quick previews when hovering items."
              checked={settings?.storeHoverPreview !== false}
              onChange={(v) => dispatch(setStoreHoverPreview(v))}
            />

            <Switch
              id="storeShowEquippedFirst"
              label="Show equipped first"
              description="Pinned equipped cosmetics to the top of the list."
              checked={settings?.storeShowEquippedFirst !== false}
              onChange={(v) => dispatch(setStoreShowEquippedFirst(v))}
            />

            <Switch
              id="storeCompactCards"
              label="Compact cards"
              description="Use a tighter card layout in the Store."
              checked={settings?.storeCompactCards}
              onChange={(v) => dispatch(setStoreCompactCards(v))}
            />

            <SelectRow
              id="storeSortKey"
              label="Default sort"
              description="Controls how Store items are ordered."
              value={settings?.storeSortKey || "recommended"}
              onChange={(v) => dispatch(setStoreSortKey(v))}
              options={[
                { value: "recommended", label: "Recommended" },
                { value: "price", label: "Price" },
                { value: "threshold", label: "Unlock threshold" },
                { value: "alpha", label: "A → Z" },
              ]}
            />
          </Card>

          <Card
            title="Potty & routines"
            subtitle="Accident tracking and quick return settings"
          >
            <Switch
              id="pottyAutoReturn"
              label="Auto-return to yard"
              description="After logging a potty event, return to the yard automatically."
              checked={settings?.pottyAutoReturn}
              onChange={(v) => dispatch(setPottyAutoReturn(v))}
            />

            <Switch
              id="pottyConfirmAccidents"
              label="Confirm accidents"
              description="Extra prompt before logging accidents."
              checked={settings?.pottyConfirmAccidents !== false}
              onChange={(v) => dispatch(setPottyConfirmAccidents(v))}
            />

            <Switch
              id="pottyShowXpTools"
              label="Show XP tools"
              description="Show extra XP helpers while logging potty."
              checked={settings?.pottyShowXpTools}
              onChange={(v) => dispatch(setPottyShowXpTools(v))}
            />

            <Switch
              id="pottyTipsExpanded"
              label="Tips expanded"
              description="Show potty tips expanded by default."
              checked={settings?.pottyTipsExpanded !== false}
              onChange={(v) => dispatch(setPottyTipsExpanded(v))}
            />
          </Card>

          <Card
            title="Dream journal"
            subtitle="Filtering and display options for dreams"
          >
            <SelectRow
              id="dreamJournalKind"
              label="Dream filter"
              description="Filter dream entries by type."
              value={settings?.dreamJournalKind || "all"}
              onChange={(v) => dispatch(setDreamJournalKind(v))}
              options={[
                { value: "all", label: "All dreams" },
                { value: "dream", label: "Dreams" },
                { value: "lucid", label: "Lucid dreams" },
                { value: "nightmare", label: "Nightmares" },
              ]}
            />

            <SelectRow
              id="dreamJournalSort"
              label="Sort order"
              description="Default ordering for dream entries."
              value={settings?.dreamJournalSort || "newest"}
              onChange={(v) => dispatch(setDreamJournalSort(v))}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ]}
            />

            <Switch
              id="dreamJournalShowSummary"
              label="Show summary"
              description="Display a short summary line for each entry."
              checked={settings?.dreamJournalShowSummary !== false}
              onChange={(v) => dispatch(setDreamJournalShowSummary(v))}
            />

            <Switch
              id="dreamJournalShowMotifs"
              label="Show motifs"
              description="Display key motifs under each entry."
              checked={settings?.dreamJournalShowMotifs !== false}
              onChange={(v) => dispatch(setDreamJournalShowMotifs(v))}
            />

            <Switch
              id="dreamJournalShowTimestamp"
              label="Show timestamps"
              description="Include the time recorded on each entry."
              checked={settings?.dreamJournalShowTimestamp !== false}
              onChange={(v) => dispatch(setDreamJournalShowTimestamp(v))}
            />

            <Switch
              id="dreamJournalCompactCards"
              label="Compact cards"
              description="Use tighter cards in the journal."
              checked={settings?.dreamJournalCompactCards}
              onChange={(v) => dispatch(setDreamJournalCompactCards(v))}
            />

            <Switch
              id="dreamSequenceShowMotifs"
              label="Sequence motifs"
              description="Show motifs during the dream sequence view."
              checked={settings?.dreamSequenceShowMotifs !== false}
              onChange={(v) => dispatch(setDreamSequenceShowMotifs(v))}
            />

            <Switch
              id="dreamSequenceShowTip"
              label="Sequence tip"
              description="Show a quick tip during dream sequences."
              checked={settings?.dreamSequenceShowTip !== false}
              onChange={(v) => dispatch(setDreamSequenceShowTip(v))}
            />

            <Switch
              id="dreamSequenceAutoDismiss"
              label="Auto-dismiss sequence"
              description="Automatically close dream sequences."
              checked={settings?.dreamSequenceAutoDismiss}
              onChange={(v) => dispatch(setDreamSequenceAutoDismiss(v))}
            />

            <Switch
              id="dreamSequenceBackdropFx"
              label="Sequence backdrop FX"
              description="Animated backdrop for dream sequences."
              checked={settings?.dreamSequenceBackdropFx !== false}
              onChange={(v) => dispatch(setDreamSequenceBackdropFx(v))}
            />
          </Card>

          <Card
            title="Badges, skill tree, and FAQs"
            subtitle="Compact views and filters"
          >
            <SelectRow
              id="badgesGroupFilter"
              label="Badges filter"
              description="Default category shown in Badges."
              value={settings?.badgesGroupFilter || "all"}
              onChange={(v) => dispatch(setBadgesGroupFilter(v))}
              options={[
                { value: "all", label: "All badges" },
                { value: "tricks", label: "Tricks" },
                { value: "cosmetics", label: "Cosmetics" },
                { value: "other", label: "Other" },
              ]}
            />

            <Switch
              id="badgesCompactChips"
              label="Compact badge chips"
              description="Smaller badge chip layout."
              checked={settings?.badgesCompactChips}
              onChange={(v) => dispatch(setBadgesCompactChips(v))}
            />

            <Switch
              id="badgesShowIds"
              label="Show badge IDs"
              description="Display badge IDs for debugging."
              checked={settings?.badgesShowIds}
              onChange={(v) => dispatch(setBadgesShowIds(v))}
            />

            <SelectRow
              id="skillTreeBranch"
              label="Skill tree branch"
              description="Default branch filter."
              value={settings?.skillTreeBranch || "all"}
              onChange={(v) => dispatch(setSkillTreeBranch(v))}
              options={[
                { value: "all", label: "All branches" },
                { value: "companion", label: "Companion" },
                { value: "guardian", label: "Guardian" },
                { value: "athlete", label: "Athlete" },
              ]}
            />

            <Switch
              id="skillTreeShowUnlockedOnly"
              label="Unlocked only"
              description="Hide locked skills until unlocked."
              checked={settings?.skillTreeShowUnlockedOnly}
              onChange={(v) => dispatch(setSkillTreeShowUnlockedOnly(v))}
            />

            <Switch
              id="skillTreeCompactCards"
              label="Compact skill cards"
              description="Reduce card height in the skill tree."
              checked={settings?.skillTreeCompactCards}
              onChange={(v) => dispatch(setSkillTreeCompactCards(v))}
            />

            <Switch
              id="faqCompactView"
              label="Compact FAQ"
              description="Use a condensed FAQ layout."
              checked={settings?.faqCompactView}
              onChange={(v) => dispatch(setFaqCompactView(v))}
            />
          </Card>

          <Card
            title="Top bar & panels"
            subtitle="HUD, mechanics, and trait panel display"
          >
            <Switch
              id="topBarCompact"
              label="Compact top bar"
              description="Smaller top bar when in game views."
              checked={settings?.topBarCompact}
              onChange={(v) => dispatch(setTopBarCompact(v))}
            />

            <Switch
              id="topBarShowXp"
              label="Show XP"
              description="Display XP in the top bar."
              checked={settings?.topBarShowXp !== false}
              onChange={(v) => dispatch(setTopBarShowXp(v))}
            />

            <Switch
              id="topBarShowStats"
              label="Show stats"
              description="Show core stats in the top bar."
              checked={settings?.topBarShowStats !== false}
              onChange={(v) => dispatch(setTopBarShowStats(v))}
            />

            <Switch
              id="topBarShowBadges"
              label="Show badges"
              description="Show badges in the top bar."
              checked={settings?.topBarShowBadges !== false}
              onChange={(v) => dispatch(setTopBarShowBadges(v))}
            />

            <Switch
              id="topBarShowQuickLinks"
              label="Show quick links"
              description="Show quick links on the top bar (if available)."
              checked={settings?.topBarShowQuickLinks !== false}
              onChange={(v) => dispatch(setTopBarShowQuickLinks(v))}
            />

            <Switch
              id="mechanicsCompact"
              label="Compact mechanics"
              description="Tighter mechanics panel layout."
              checked={settings?.mechanicsCompact}
              onChange={(v) => dispatch(setMechanicsCompact(v))}
            />

            <Switch
              id="mechanicsShowTips"
              label="Mechanics tips"
              description="Show tips in the mechanics panel."
              checked={settings?.mechanicsShowTips !== false}
              onChange={(v) => dispatch(setMechanicsShowTips(v))}
            />

            <Switch
              id="mechanicsShowStats"
              label="Mechanics stats"
              description="Show stat blocks in mechanics panel."
              checked={settings?.mechanicsShowStats !== false}
              onChange={(v) => dispatch(setMechanicsShowStats(v))}
            />

            <Switch
              id="mechanicsShowUnlockLine"
              label="Unlock line"
              description="Show unlock hints in mechanics panel."
              checked={settings?.mechanicsShowUnlockLine !== false}
              onChange={(v) => dispatch(setMechanicsShowUnlockLine(v))}
            />

            <Switch
              id="traitImpactCompact"
              label="Compact trait impact"
              description="Compact layout for trait impact panel."
              checked={settings?.traitImpactCompact}
              onChange={(v) => dispatch(setTraitImpactCompact(v))}
            />

            <Switch
              id="traitImpactShowMeter"
              label="Trait impact meter"
              description="Show the impact meter in trait panel."
              checked={settings?.traitImpactShowMeter !== false}
              onChange={(v) => dispatch(setTraitImpactShowMeter(v))}
            />

            <Switch
              id="traitImpactShowTips"
              label="Trait impact tips"
              description="Show tips inside the trait panel."
              checked={settings?.traitImpactShowTips !== false}
              onChange={(v) => dispatch(setTraitImpactShowTips(v))}
            />

            <Switch
              id="traitImpactShowHighlights"
              label="Trait highlights"
              description="Highlight strong/weak trait impacts."
              checked={settings?.traitImpactShowHighlights !== false}
              onChange={(v) => dispatch(setTraitImpactShowHighlights(v))}
            />
          </Card>

          <Card
            title="Dog rendering"
            subtitle="Fine-tune visuals for sprites, Pixi, and canvases"
          >
            <Switch
              id="dogCanvasMotion"
              label="Canvas motion"
              description="Enable subtle motion on canvas-based dog renders."
              checked={settings?.dogCanvasMotion !== false}
              onChange={(v) => dispatch(setDogCanvasMotion(v))}
            />

            <Switch
              id="dogCanvasShadow"
              label="Canvas shadow"
              description="Show a soft shadow under the dog."
              checked={settings?.dogCanvasShadow !== false}
              onChange={(v) => dispatch(setDogCanvasShadow(v))}
            />

            <SelectRow
              id="dogCanvasScale"
              label="Canvas scale"
              description="Size of the dog canvas renderer."
              value={settings?.dogCanvasScale || "normal"}
              onChange={(v) => dispatch(setDogCanvasScale(v))}
              options={[
                { value: "small", label: "Small" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
            />

            <Switch
              id="dogPixiMotion"
              label="Pixi motion"
              description="Enable Pixi animation loops."
              checked={settings?.dogPixiMotion !== false}
              onChange={(v) => dispatch(setDogPixiMotion(v))}
            />

            <SelectRow
              id="dogPixiScale"
              label="Pixi scale"
              description="Size of the Pixi renderer."
              value={settings?.dogPixiScale || "normal"}
              onChange={(v) => dispatch(setDogPixiScale(v))}
              options={[
                { value: "small", label: "Small" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
            />

            <SelectRow
              id="dogPixiQuality"
              label="Pixi quality"
              description="Texture quality for Pixi renderer."
              value={settings?.dogPixiQuality || "auto"}
              onChange={(v) => dispatch(setDogPixiQuality(v))}
              options={[
                { value: "auto", label: "Auto" },
                { value: "low", label: "Low" },
                { value: "high", label: "High" },
              ]}
            />

            <Switch
              id="spriteSheetMotion"
              label="Sprite sheet motion"
              description="Enable sprite sheet animations."
              checked={settings?.spriteSheetMotion !== false}
              onChange={(v) => dispatch(setSpriteSheetMotion(v))}
            />

            <Switch
              id="spriteSheetUsePixelated"
              label="Pixelated sprites"
              description="Use hard edges for sprite sheet rendering."
              checked={settings?.spriteSheetUsePixelated}
              onChange={(v) => dispatch(setSpriteSheetUsePixelated(v))}
            />

            <SelectRow
              id="spriteSheetSize"
              label="Sprite sheet size"
              description="Scale for sprite sheet rendering."
              value={settings?.spriteSheetSize || "normal"}
              onChange={(v) => dispatch(setSpriteSheetSize(v))}
              options={[
                { value: "small", label: "Small" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
            />

            <Switch
              id="pixiDogMotion"
              label="PixiDog motion"
              description="Enable animated PixiDog layers."
              checked={settings?.pixiDogMotion !== false}
              onChange={(v) => dispatch(setPixiDogMotion(v))}
            />

            <Switch
              id="pixiDogShowHearts"
              label="PixiDog hearts"
              description="Show heart particles for PixiDog."
              checked={settings?.pixiDogShowHearts !== false}
              onChange={(v) => dispatch(setPixiDogShowHearts(v))}
            />

            <Switch
              id="pixiDogShowShadow"
              label="PixiDog shadow"
              description="Show a shadow under PixiDog."
              checked={settings?.pixiDogShowShadow !== false}
              onChange={(v) => dispatch(setPixiDogShowShadow(v))}
            />

            <SelectRow
              id="pixiDogQuality"
              label="PixiDog quality"
              description="Rendering quality for PixiDog."
              value={settings?.pixiDogQuality || "auto"}
              onChange={(v) => dispatch(setPixiDogQuality(v))}
              options={[
                { value: "auto", label: "Auto" },
                { value: "low", label: "Low" },
                { value: "high", label: "High" },
              ]}
            />
          </Card>

          <Card
            title="Game effects"
            subtitle="Visual cues for progress and story beats"
          >
            <Switch
              id="gameFxSkillPulse"
              label="Skill pulse"
              description="Pulse effect when a skill unlocks."
              checked={settings?.gameFxSkillPulse !== false}
              onChange={(v) => dispatch(setGameFxSkillPulse(v))}
            />

            <Switch
              id="gameFxStoryGlow"
              label="Story glow"
              description="Glow when a story/poll is active."
              checked={settings?.gameFxStoryGlow !== false}
              onChange={(v) => dispatch(setGameFxStoryGlow(v))}
            />

            <Switch
              id="gameFxBranchAccent"
              label="Branch accent"
              description="Accent the active skill branch in the UI."
              checked={settings?.gameFxBranchAccent !== false}
              onChange={(v) => dispatch(setGameFxBranchAccent(v))}
            />
          </Card>

          <Card
            title="Cosmetics overlay"
            subtitle="Control cosmetic labels and preview tags"
          >
            <Switch
              id="cosmeticsOverlayShowLabels"
              label="Show labels"
              description="Show collar/tag/backdrop labels in preview."
              checked={settings?.cosmeticsOverlayShowLabels !== false}
              onChange={(v) => dispatch(setCosmeticsOverlayShowLabels(v))}
            />

            <Switch
              id="cosmeticsOverlayShowPreviewTags"
              label="Show preview tags"
              description="Show small tag chips for equipped cosmetics."
              checked={settings?.cosmeticsOverlayShowPreviewTags !== false}
              onChange={(v) => dispatch(setCosmeticsOverlayShowPreviewTags(v))}
            />

            <SelectRow
              id="cosmeticsOverlayPosition"
              label="Overlay position"
              description="Where the cosmetics overlay appears."
              value={settings?.cosmeticsOverlayPosition || "top-left"}
              onChange={(v) => dispatch(setCosmeticsOverlayPosition(v))}
              options={[
                { value: "top-left", label: "Top left" },
                { value: "top-right", label: "Top right" },
                { value: "bottom-left", label: "Bottom left" },
                { value: "bottom-right", label: "Bottom right" },
              ]}
            />
          </Card>

          <Card
            title="Training UI"
            subtitle="Sort order and card detail density"
          >
            <Switch
              id="trainingShowLocked"
              label="Show locked tricks"
              description="Keep locked tricks visible in the list."
              checked={settings?.trainingShowLocked !== false}
              onChange={(v) => dispatch(setTrainingShowLocked(v))}
            />

            <Switch
              id="trainingCompactCards"
              label="Compact cards"
              description="Use smaller training cards."
              checked={settings?.trainingCompactCards}
              onChange={(v) => dispatch(setTrainingCompactCards(v))}
            />

            <Switch
              id="trainingShowDetails"
              label="Show details"
              description="Show expanded details in training cards."
              checked={settings?.trainingShowDetails !== false}
              onChange={(v) => dispatch(setTrainingShowDetails(v))}
            />

            <SelectRow
              id="trainingSortKey"
              label="Sort order"
              description="How training items are ordered."
              value={settings?.trainingSortKey || "status"}
              onChange={(v) => dispatch(setTrainingSortKey(v))}
              options={[
                { value: "status", label: "Status" },
                { value: "alpha", label: "A → Z" },
              ]}
            />
          </Card>

          <Card
            title="Notifications"
            subtitle="Gentle reminders and status"
            bodyClassName="space-y-3"
          >
            <Switch
              id="dailyRemindersEnabled"
              label="Daily routine reminders"
              description="Shows a gentle reminder when your pup needs attention."
              checked={settings?.dailyRemindersEnabled !== false}
              onChange={(v) => dispatch(setDailyRemindersEnabled(v))}
            />

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3 dark:bg-black/20">
              <div className="text-xs text-doggerz-paw/70">
                <div className="text-sm font-semibold text-doggerz-bone">
                  Status
                </div>
                <div className="mt-1">
                  Permission:{" "}
                  <span className="font-semibold text-doggerz-bone">
                    {notificationPermission === "unsupported"
                      ? "Not supported"
                      : notificationPermission}
                  </span>
                </div>
                <div className="mt-1">
                  Last reminder:{" "}
                  <span className="font-semibold text-doggerz-bone">
                    {lastReminder?.at
                      ? `${lastReminder.label || lastReminder.key} - ${formatTimestamp(
                          lastReminder.at
                        )}`
                      : "None yet"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  title="Request notification permission from the device."
                  onClick={async () => {
                    if (!canUseNotifications()) {
                      toast.info("Notifications are not supported here.");
                      setNotificationPermission("unsupported");
                      return;
                    }
                    const perm = await requestNotificationsPermission();
                    setNotificationPermission(perm);
                    if (perm === "granted") {
                      toast.success("Notifications enabled.");
                    } else {
                      toast.info("Notifications not enabled.");
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-doggerz-leaf/45 bg-doggerz-neon/15 px-4 py-2 text-xs font-semibold text-doggerz-bone hover:bg-doggerz-neon/25 transition"
                >
                  Enable notifications
                </button>

                <button
                  type="button"
                  title="Send a test Doggerz notification to this device."
                  onClick={async () => {
                    if (!canUseNotifications()) {
                      toast.info("Notifications are not supported here.");
                      return;
                    }
                    if (notificationPermission !== "granted") {
                      toast.info("Enable notifications to send a test ping.");
                      return;
                    }
                    const ok = await showDoggerzNotification({
                      title: "Doggerz",
                      body: "Test ping. Your pup is ready to play.",
                      tag: "dz-test",
                    });
                    if (ok) toast.success("Test notification sent.");
                    else toast.warn("Unable to show notification.");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-doggerz-mange/45 bg-black/25 px-4 py-2 text-xs font-semibold text-doggerz-bone hover:bg-black/35 transition"
                >
                  Send test ping
                </button>
              </div>
            </div>
          </Card>

          <Card title="Audio" subtitle="Controls are saved; wiring is ongoing">
            <Switch
              id="audioEnabled"
              label="Enable audio"
              description="Master audio toggle."
              checked={settings?.audio?.enabled}
              onChange={(v) => dispatch(setAudioEnabled(v))}
            />

            <Switch
              id="musicEnabled"
              label="Music"
              description="Toggle background music without muting SFX."
              checked={settings?.audio?.musicEnabled !== false}
              onChange={(v) => dispatch(setMusicEnabled(v))}
            />

            <Switch
              id="hapticsEnabled"
              label="Haptics (vibration)"
              description="Little taps for rewards and important feedback (mobile only)."
              checked={settings?.hapticsEnabled !== false}
              onChange={(v) => dispatch(setHapticsEnabled(v))}
            />

            <SliderRow
              id="masterVolume"
              label="Master volume"
              value={Number(settings?.audio?.masterVolume ?? 0.8)}
              onChange={(v) => dispatch(setMasterVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.masterVolume ?? 0.8)}%`}
            />

            <SliderRow
              id="musicVolume"
              label="Music volume"
              value={Number(settings?.audio?.musicVolume ?? 0.5)}
              onChange={(v) => dispatch(setMusicVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.musicVolume ?? 0.5)}%`}
            />

            <SliderRow
              id="sfxVolume"
              label="SFX volume"
              value={Number(settings?.audio?.sfxVolume ?? 0.7)}
              onChange={(v) => dispatch(setSfxVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.sfxVolume ?? 0.7)}%`}
            />

            <Switch
              id="sleepAudioEnabled"
              label="Sleep ambience"
              description="Soft breathing/snore loop while your pup sleeps."
              checked={settings?.audio?.sleepEnabled !== false}
              onChange={(v) => dispatch(setSleepAudioEnabled(v))}
            />

            <SliderRow
              id="sleepVolume"
              label="Sleep ambience volume"
              value={Number(settings?.audio?.sleepVolume ?? 0.25)}
              onChange={(v) => dispatch(setSleepVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.sleepVolume ?? 0.25)}%`}
            />
          </Card>

          <Card
            title="Location"
            subtitle="ZIP fallback with optional precise sunrise/sunset timing"
          >
            <Switch
              id="preciseDayNightLocation"
              label="Use device location for day/night"
              description="Optional. Uses approximate device location for more accurate dawn/dusk and night timing. ZIP remains the fallback."
              checked={preciseDayNightLocationEnabled}
              onChange={handlePreciseDayNightLocationToggle}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:w-auto">
                <label
                  className="block text-xs text-doggerz-paw/70 mb-1"
                  htmlFor="zip"
                >
                  ZIP (US)
                </label>
                <input
                  id="zip"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="w-full sm:w-56 rounded-xl border border-doggerz-mange/55 bg-black/30 px-3 py-2 text-sm text-doggerz-bone placeholder:text-doggerz-paw/45 outline-none focus:border-doggerz-leaf/70"
                  placeholder="e.g. 10001"
                  value={zipInput}
                  title="Save a ZIP code for local sunrise/sunset and weather timing."
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D+/g, "").slice(0, 5);
                    setZipInput(v);
                  }}
                />
                {!zipIsValid ? (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">
                    Enter 5 digits (or clear).
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-doggerz-leaf px-4 py-2 text-sm font-semibold text-black hover:bg-doggerz-neonSoft disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => setZip(zipInput)}
                  disabled={!zipIsValid}
                  title="Save ZIP code to settings."
                >
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-doggerz-mange/55 bg-black/30 px-4 py-2 text-sm font-semibold text-doggerz-bone hover:bg-black/40"
                  onClick={() => {
                    setZipInput("");
                    setZip("");
                  }}
                  title="Clear stored ZIP code."
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="text-xs text-doggerz-paw/65 leading-snug space-y-1">
              <p>
                Status:{" "}
                <span className="text-doggerz-bone">
                  {preciseDayNightLocationEnabled
                    ? "Precise location enabled"
                    : "Using ZIP fallback"}
                </span>{" "}
                {preciseDayNightLocationEnabled
                  ? currentZip
                    ? `(ZIP fallback ${currentZip})`
                    : "(no ZIP fallback saved)"
                  : currentZip
                    ? `(ZIP ${currentZip})`
                    : "(none)"}
              </p>
              <p>
                Weather still uses your saved ZIP. Device location only refines
                sunrise and sunset timing when enabled.
              </p>
            </div>
          </Card>

          <Card
            title="Safety & confirmations"
            subtitle="Avoid accidental resets"
          >
            <Switch
              id="confirmDangerous"
              label="Confirm dangerous actions"
              description="Adds an extra confirmation step before resets/imports/clears."
              checked={settings?.confirmDangerousActions}
              onChange={(v) => dispatch(setConfirmDangerousActions(v))}
            />
          </Card>

          <Card
            title="Backup & restore"
            subtitle="Move your local save/settings between devices"
          >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-doggerz-mange/55 bg-black/30 px-4 py-2 text-sm font-semibold text-doggerz-bone hover:border-doggerz-leaf/70 hover:text-doggerz-leaf"
                onClick={exportLocalData}
                title="Export local dog, user, and settings data as JSON."
              >
                Export backup
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-doggerz-mange/55 bg-black/30 px-4 py-2 text-sm font-semibold text-doggerz-bone hover:border-doggerz-leaf/70 hover:text-doggerz-leaf"
                onClick={() => fileInputRef.current?.click()}
                title="Import a previously exported backup JSON."
              >
                Import backup
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                title="Choose a Doggerz backup JSON file."
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // allow re-selecting same file later
                  e.target.value = "";
                  importLocalData(file);
                }}
              />
            </div>

            {localActionStatus ? (
              <div className="mt-3 rounded-xl border border-doggerz-leaf/45 bg-doggerz-neon/15 px-3 py-2 text-xs text-doggerz-bone">
                {localActionStatus}
              </div>
            ) : null}

            <p className="text-xs text-doggerz-paw/70">
              Exports include local dog save, local user state, and settings for
              this browser.
            </p>
          </Card>

          <Card
            title="Data"
            subtitle="Local-only actions (cloud data is not deleted)"
          >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                onClick={resetPupLocal}
                title="Reset local pup progression on this device."
              >
                Reset pup (local)
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-doggerz-mange/55 bg-black/30 px-4 py-2 text-sm font-semibold text-doggerz-bone hover:border-doggerz-leaf/70 hover:text-doggerz-leaf"
                onClick={() => dispatch(resetSettings())}
                title="Restore all settings to defaults."
              >
                Reset settings
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                onClick={clearLocalStorageAll}
                title="Clear all local Doggerz storage on this device."
              >
                Clear all local storage
              </button>
            </div>
          </Card>

          <Card
            title="About this build"
            subtitle="Handy details for support and release checks"
            className="self-start p-4"
            bodyClassName="space-y-2"
          >
            <div className="text-sm text-doggerz-paw">
              Version: <span className="font-semibold">{APP_VERSION}</span>
            </div>
          </Card>

          <Card
            title="Support & policies"
            subtitle="Low-profile utility links only"
            className="self-start"
            bodyClassName="space-y-3"
          >
            <Link
              to={PATHS.HELP}
              className="block rounded-2xl border border-doggerz-mange/45 bg-black/25 px-4 py-3 transition hover:border-doggerz-leaf/60 hover:bg-doggerz-neon/10"
            >
              <div className="text-sm font-semibold text-doggerz-bone">
                Help
              </div>
              <div className="mt-1 text-xs text-doggerz-paw/75">
                Troubleshooting, support steps, and diagnostics.
              </div>
            </Link>

            <Link
              to={PATHS.ABOUT}
              className="block rounded-2xl border border-doggerz-mange/45 bg-black/25 px-4 py-3 transition hover:border-doggerz-leaf/60 hover:bg-doggerz-neon/10"
            >
              <div className="text-sm font-semibold text-doggerz-bone">
                About
              </div>
              <div className="mt-1 text-xs text-doggerz-paw/75">
                How Doggerz works, what keeps ticking, and where to find
                developer notes.
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-doggerz-paw/75">
              <Link
                to={PATHS.PRIVACY}
                className="transition hover:text-doggerz-bone"
              >
                Privacy
              </Link>
              <Link
                to={PATHS.LEGAL}
                className="transition hover:text-doggerz-bone"
              >
                Legal
              </Link>
              <Link
                to={PATHS.CONTACT}
                className="transition hover:text-doggerz-bone"
              >
                Contact
              </Link>
            </div>

            <p className="text-xs text-doggerz-paw/60">
              These pages stay available when needed, but they are no longer
              part of the main app flow.
            </p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
