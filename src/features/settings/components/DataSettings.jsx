import React, { useState, useEffect } from "react";

export default function DataSettings({
  notificationsEnabled: propNotifications,
  soundEnabled: propSound,
  onNotificationsChange,
  onSoundChange,
  onDeleteAccount,
  onResetLocalDog,
  onClearLocalStorage,
  onDownloadBackup,
}) {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(!!propNotifications);
  const [soundEnabled, setSoundEnabled] = useState(!!propSound);

  useEffect(
    () => setNotificationsEnabled(!!propNotifications),
    [propNotifications],
  );
  useEffect(() => setSoundEnabled(!!propSound), [propSound]);

  const handleClearLocal = () => {
    if (onClearLocalStorage) return onClearLocalStorage();
    try {
      window.localStorage.removeItem("doggerz:dogState");
    } catch (e) {
      console.warn("clearLocalSave failed", e);
    }
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm(
      "Delete account and all cloud data? This cannot be undone.",
    );
    if (!ok) return;
    if (onDeleteAccount) {
      onDeleteAccount();
      return;
    }
    // Fallback: clear local auth + data
    try {
      window.localStorage.removeItem("doggerz:auth");
      window.localStorage.removeItem("doggerz:dogState");
      window.localStorage.removeItem("doggerz:settings");
    } catch (e) {
      console.warn("fallback delete account failed", e);
    }
    alert("Local account and data cleared (no cloud deletion performed).");
    window.location.reload();
  };

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    if (onNotificationsChange) onNotificationsChange(next);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (onSoundChange) onSoundChange(next);
  };

  return (
    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-semibold">Data & Device</h3>
      <p className="text-xs text-zinc-400 mt-1">
        Manage local saves, notifications, and device preferences.
      </p>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Notifications</div>
            <div className="text-xs text-zinc-400">
              Enable browser reminders (permission required)
            </div>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Sound</div>
            <div className="text-xs text-zinc-400">
              Play UI sounds and reward chimes
            </div>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleToggleSound}
            />
          </label>
        </div>

        <div className="text-xs text-zinc-500">
          Use the header actions for data export / reset.
        </div>
      </div>
    </div>
  );
}
