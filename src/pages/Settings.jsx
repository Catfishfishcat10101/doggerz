// src/pages/Settings.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetDogState,
  DOG_STORAGE_KEY,
  DOG_SAVE_SCHEMA_VERSION,
  selectDogCosmetics,
  selectCosmeticCatalog,
  equipCosmetic,
} from "@/redux/dogSlice.js";
import { selectUserZip, setZip } from "@/redux/userSlice.js";
import { auth, db, firebaseReady } from "@/firebase.js";
import { signOut, deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import {
  hydrateSettings,
  resetSettings,
  selectSettings,
  setAudioEnabled,
  setConfirmDangerousActions,
  setFontScale,
  setFocusRings,
  setHighContrast,
  setHitTargets,
  setMasterVolume,
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
  setSfxVolume,
  setShowHints,
  setDailyRemindersEnabled,
  setTheme,
  setVoiceCommandsEnabled,
  setHapticsEnabled,
  SETTINGS_STORAGE_KEY,
} from "@/redux/settingsSlice.js";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { APP_VERSION } from "@/utils/appVersion.js";

const USER_STORAGE_KEY = "doggerz:userState";

function pct(n) {
  const v = Math.round(Number(n) * 100);
  return Number.isFinite(v) ? v : 0;
}

function Switch({ id, checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>

      <div className="shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label
          htmlFor={id}
          className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border border-zinc-300 bg-zinc-200 transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-500/80 peer-focus-visible:outline-offset-2 peer-checked:bg-emerald-500/80 dark:border-zinc-700 dark:bg-zinc-900/70"
        >
          <span className="sr-only">{label}</span>
          <span className="inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </label>
      </div>
    </div>
  );
}

function SelectRow({ id, label, description, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-56 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500/70 focus:outline-none dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100"
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

function SliderRow({ id, label, description, value, onChange, min, max, step, rightLabel }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {label}
          </label>
          {description ? (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
          ) : null}
        </div>
        {rightLabel ? (
          <div className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{rightLabel}</div>
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
        className="w-full"
      />
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-black/20">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const currentZip = useSelector(selectUserZip);
  const cosmetics = useSelector(selectDogCosmetics);
  const cosmeticCatalog = useSelector(selectCosmeticCatalog);

  const unlockedBySlot = useMemo(() => {
    const unlocked = new Set(cosmetics?.unlockedIds || []);
    const items = Array.isArray(cosmeticCatalog) ? cosmeticCatalog : [];
    const bySlot = { collar: [], tag: [], backdrop: [] };
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      if (!unlocked.has(it.id)) continue;
      if (!it.slot || !(it.slot in bySlot)) continue;
      bySlot[it.slot].push(it);
    }
    for (const slot of Object.keys(bySlot)) {
      bySlot[slot].sort((a, b) => (a.threshold || 0) - (b.threshold || 0));
    }
    return bySlot;
  }, [cosmetics?.unlockedIds, cosmeticCatalog]);

  const [zipInput, setZipInput] = useState(currentZip || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setZipInput(currentZip || "");
  }, [currentZip]);

  const zipIsValid = useMemo(() => !zipInput || /^\d{5}$/.test(zipInput), [zipInput]);

  const [cloudActionStatus, setCloudActionStatus] = useState(null);
  const [localActionStatus, setLocalActionStatus] = useState(null);
  const [cloudBusy, setCloudBusy] = useState(false);

  const cloudUser = firebaseReady ? auth?.currentUser : null;

  async function handleSignOut() {
    if (!firebaseReady || !auth) return;
    try {
      setCloudBusy(true);
      setCloudActionStatus(null);
      await signOut(auth);
      setCloudActionStatus("Signed out.");
    } catch (e) {
      console.error("[Settings] signOut failed", e);
      setCloudActionStatus("Sign out failed. Try again.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (!firebaseReady || !auth || !db || !auth.currentUser) return;

    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm(
        "This will permanently delete your cloud account and cloud save data. Local data on this device is not automatically cleared. Continue?",
      );
      if (!ok) return;
    }

    const user = auth.currentUser;
    try {
      setCloudBusy(true);
      setCloudActionStatus(null);

      // Best-effort: delete cloud dog save first.
      try {
        const dogRef = doc(db, "users", user.uid, "dog", "state");
        await deleteDoc(dogRef);
      } catch (e) {
        console.warn("[Settings] delete cloud save failed", e);
      }

      await deleteUser(user);
      setCloudActionStatus(
        "Account deleted. If you want to remove local data too, use 'Clear all local storage' below.",
      );
    } catch (e) {
      console.error("[Settings] deleteUser failed", e);
      const code = e?.code || "";
      if (code === "auth/requires-recent-login") {
        setCloudActionStatus(
          "Account deletion requires a recent login. Please log out, log back in, then try again.",
        );
      } else {
        setCloudActionStatus("Account deletion failed. Try again or contact support.");
      }
    } finally {
      setCloudBusy(false);
    }
  }

  function exportLocalData() {
    const payload = {
      format: "doggerz-export",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        dog: (() => {
          try {
            return JSON.parse(localStorage.getItem(DOG_STORAGE_KEY) || "null");
          } catch {
            return null;
          }
        })(),
        user: (() => {
          try {
            return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
          } catch {
            return null;
          }
        })(),
        settings: (() => {
          try {
            return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "null");
          } catch {
            return null;
          }
        })(),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doggerz-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

    const ok = window.confirm(
      "Importing will overwrite your local Doggerz save + settings on this device. Continue?",
    );
    if (!ok) return;

    try {
      if (data.dog) {
        const persistedDog = {
          ...data.dog,
          meta: {
            ...(data.dog?.meta || {}),
            schemaVersion: DOG_SAVE_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
          },
        };
        localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(persistedDog));
      }
      if (data.user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      if (data.settings) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
        dispatch(hydrateSettings(data.settings));
      }
      setLocalActionStatus("Import successful. Reloading…");
      window.location.reload();
    } catch (e) {
      console.error(e);
      setLocalActionStatus("Import failed. Check the console for details.");
    }
  }

  function clearLocalStorageAll() {
    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm(
        "This clears ALL local Doggerz data on this device (save + settings). Cloud data (if any) is not deleted. Continue?",
      );
      if (!ok) return;
    }

    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLocalActionStatus("Could not clear storage.");
    }
  }

  function resetPupLocal() {
    const confirmGate = settings?.confirmDangerousActions ?? true;
    if (confirmGate) {
      const ok = window.confirm("Reset your local pup progress on this device?");
      if (!ok) return;
    }

    try {
      localStorage.removeItem(DOG_STORAGE_KEY);
    } catch {
      // ignore
    }

    dispatch(resetDogState());
    setLocalActionStatus("Local pup reset.");
  }

  return (
    <>
      <Header />
      <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Customize your Doggerz experience on this device. Most settings save automatically.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Account & cloud"
            subtitle="Optional cloud features (Firebase). Offline play works without an account."
          >
            {!firebaseReady ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Cloud features are currently disabled because Firebase isn’t configured.
              </p>
            ) : cloudUser ? (
              <div className="space-y-3">
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  Signed in as <span className="font-semibold">{cloudUser.email || cloudUser.uid}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={cloudBusy}
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-emerald-500/60 hover:text-emerald-700 disabled:opacity-60 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:text-emerald-200"
                  >
                    Sign out
                  </button>

                  <button
                    type="button"
                    disabled={cloudBusy}
                    onClick={handleDeleteAccount}
                    className="inline-flex items-center justify-center rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
                  >
                    Delete account (cloud)
                  </button>
                </div>

                {cloudActionStatus ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {cloudActionStatus}
                  </p>
                ) : null}

                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Deleting your account attempts to remove your cloud save at <code>users/&lt;uid&gt;/dog/state</code>.
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You’re not signed in. Visit <Link className="text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200" to="/login">Login</Link> to enable cloud sync.
              </p>
            )}
          </Card>

          <Card
            title="Appearance"
            subtitle="Theme and visual comfort settings"
          >
            <SelectRow
              id="theme"
              label="Theme"
              description="Pick a theme, or follow your device setting. (This also toggles Tailwind dark mode.)"
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
                description="Disables heavy visual effects (weather particles, ambient animations) to save battery and reduce heat."
                checked={settings?.batterySaver}
                onChange={(v) => dispatch(setBatterySaver(v))}
              />
          </Card>

          <Card
            title="Accessibility"
            subtitle="Motion, focus, and touch targets"
          >
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-black/30">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Presets</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  One-tap comfort profiles (you can fine-tune below).
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setReduceMotion("system"));
                      dispatch(setReduceTransparency(false));
                      dispatch(setHighContrast(false));
                      dispatch(setHitTargets("auto"));
                      dispatch(setFocusRings("auto"));
                      dispatch(setFontScale(1));
                    }}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setReduceMotion("on"));
                      dispatch(setReduceTransparency(true));
                      dispatch(setHighContrast(false));
                      dispatch(setHitTargets("large"));
                      dispatch(setFocusRings("always"));
                      dispatch(setFontScale(1.06));
                    }}
                  >
                    Comfort
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setHighContrast(true));
                      dispatch(setFocusRings("always"));
                      dispatch(setHitTargets("large"));
                    }}
                  >
                    High-visibility
                  </button>
                </div>
              </div>

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

            <Switch
              id="voiceCommandsEnabled"
              label="Voice commands"
              description="Show voice command controls in the game. Disable if you don’t want mic prompts."
              checked={settings?.voiceCommandsEnabled}
              onChange={(v) => dispatch(setVoiceCommandsEnabled(v))}
            />
          </Card>

            <Card
              title="Game controls"
              subtitle="How you train and what shows up on the Game screen"
            >
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/rainbow-bridge"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                >
                  Visit Rainbow Bridge
                </Link>
              </div>

              <SelectRow
                id="trainingInputMode"
                label="Training input"
                description="Choose button training, voice training, or both."
                value={settings?.trainingInputMode || (settings?.voiceCommandsEnabled ? "both" : "buttons")}
                onChange={(v) => dispatch(setTrainingInputMode(v))}
                options={[
                  { value: "buttons", label: "Buttons only" },
                  { value: "voice", label: "Voice only" },
                  { value: "both", label: "Buttons + voice" },
                ]}
              />

              <Switch
                id="showGameMicroHud"
                label="Show Weather/Time/Coach chips"
                description="Toggles the small chips row at the top of the Game screen."
                checked={settings?.showGameMicroHud !== false}
                onChange={(v) => dispatch(setShowGameMicroHud(v))}
              />

              <Switch
                id="dailyRemindersEnabled"
                label="Daily routine reminders"
                description="Shows a gentle in-app reminder if you haven't done a care action today."
                checked={settings?.dailyRemindersEnabled !== false}
                onChange={(v) => dispatch(setDailyRemindersEnabled(v))}
              />

              <Switch
                id="showCritters"
                label="Show critters (bugs/butterflies)"
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
              title="Cosmetics"
              subtitle="Streak rewards you can equip. More visuals coming soon."
            >
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Unlocked: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{cosmetics?.unlockedIds?.length || 0}</span>
              </div>

              <SelectRow
                id="cosmetic_collar"
                label="Collar"
                description="Equipped collar cosmetic"
                value={cosmetics?.equipped?.collar || ""}
                onChange={(v) => dispatch(equipCosmetic({ slot: "collar", id: v }))}
                options={[
                  { value: "", label: "None" },
                  ...(unlockedBySlot.collar || []).map((c) => ({
                    value: c.id,
                    label: c.label || c.id,
                  })),
                ]}
              />

              <SelectRow
                id="cosmetic_tag"
                label="Tag"
                description="Equipped tag cosmetic"
                value={cosmetics?.equipped?.tag || ""}
                onChange={(v) => dispatch(equipCosmetic({ slot: "tag", id: v }))}
                options={[
                  { value: "", label: "None" },
                  ...(unlockedBySlot.tag || []).map((c) => ({
                    value: c.id,
                    label: c.label || c.id,
                  })),
                ]}
              />

              <SelectRow
                id="cosmetic_backdrop"
                label="Backdrop"
                description="Equipped background cosmetic"
                value={cosmetics?.equipped?.backdrop || ""}
                onChange={(v) => dispatch(equipCosmetic({ slot: "backdrop", id: v }))}
                options={[
                  { value: "", label: "None" },
                  ...(unlockedBySlot.backdrop || []).map((c) => ({
                    value: c.id,
                    label: c.label || c.id,
                  })),
                ]}
              />
            </Card>

          <Card
            title="Audio"
            subtitle="Controls are saved now; full app-wide wiring is ongoing"
          >
            <Switch
              id="audioEnabled"
              label="Enable audio"
              description="Master audio toggle."
              checked={settings?.audio?.enabled}
              onChange={(v) => dispatch(setAudioEnabled(v))}
            />

              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-black/30">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick presets</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">A fast way to set sane levels.</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setAudioEnabled(true));
                      dispatch(setMasterVolume(0.55));
                      dispatch(setSfxVolume(0.45));
                      dispatch(setMusicVolume(0.25));
                    }}
                  >
                    Quiet
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setAudioEnabled(true));
                      dispatch(setMasterVolume(0.8));
                      dispatch(setSfxVolume(0.7));
                      dispatch(setMusicVolume(0.5));
                    }}
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/40"
                    onClick={() => {
                      dispatch(setAudioEnabled(true));
                      dispatch(setMasterVolume(1));
                      dispatch(setSfxVolume(0.9));
                      dispatch(setMusicVolume(0.65));
                    }}
                  >
                    Loud
                  </button>
                </div>
              </div>

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
              value={Number(settings?.audio?.musicVolume ?? 0.6)}
              onChange={(v) => dispatch(setMusicVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.musicVolume ?? 0.6)}%`}
            />

            <SliderRow
              id="sfxVolume"
              label="SFX volume"
              value={Number(settings?.audio?.sfxVolume ?? 0.8)}
              onChange={(v) => dispatch(setSfxVolume(v))}
              min={0}
              max={1}
              step={0.01}
              rightLabel={`${pct(settings?.audio?.sfxVolume ?? 0.8)}%`}
            />

              <Switch
                id="sleepAudioEnabled"
                label="Sleep ambience"
                description="A soft breathing/snore loop while your pup sleeps. (No external audio files.)"
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
            subtitle="Used for optional sunrise/sunset timing for day/night backgrounds"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1" htmlFor="zip">
                  ZIP (US)
                </label>
                <input
                  id="zip"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="w-full sm:w-56 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-emerald-500/70 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100"
                  placeholder="e.g. 10001"
                  value={zipInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D+/g, "").slice(0, 5);
                    setZipInput(v);
                  }}
                />
                {!zipIsValid ? (
                  <p className="mt-1 text-xs text-amber-200">Enter 5 digits.</p>
                ) : null}
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => dispatch(setZip(zipInput))}
                disabled={!zipIsValid}
              >
                Save ZIP
              </button>
            </div>

            <div className="text-xs text-zinc-400 leading-snug space-y-1">
              <p>
                Status: <span className="text-zinc-800 dark:text-zinc-200">Using ZIP</span>{" "}
                {currentZip ? `(ZIP ${currentZip})` : ""}
              </p>
              <p>
                Requires <code>VITE_OPENWEATHER_API_KEY</code>; without it, Doggerz falls back to your device time.
              </p>
            </div>
          </Card>

          <Card
            title="Safety & confirmations"
            subtitle="Avoid accidental resets and overwrites"
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
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-emerald-500/60 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:text-emerald-200"
                onClick={exportLocalData}
              >
                Export backup
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-emerald-500/60 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:text-emerald-200"
                onClick={() => fileInputRef.current?.click()}
              >
                Import backup
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // allow re-selecting same file later
                  e.target.value = "";
                  importLocalData(file);
                }}
              />
            </div>

              {localActionStatus ? (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {localActionStatus}
                </div>
              ) : null}

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Exports include local dog save, local user state, and settings for this browser.
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
              >
                Reset pup (local)
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-emerald-500/60 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-100 dark:hover:text-emerald-200"
                onClick={() => dispatch(resetSettings())}
              >
                Reset settings
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                onClick={clearLocalStorageAll}
              >
                Clear all local storage
              </button>
            </div>

              {localActionStatus ? (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {localActionStatus}
                </div>
              ) : null}

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
              If you’re signed in, cloud sync may re-download your pup later. Clearing local storage does not delete cloud-stored data.
            </p>
          </Card>

          <Card
            title="About this build"
            subtitle="Handy details for support and Play release checks"
          >
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              Version: <span className="font-semibold">{APP_VERSION}</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              If you report a bug, include the version above.
            </div>
          </Card>
        </div>
      </div>
      </main>

      <Footer />
    </>
  );
}
