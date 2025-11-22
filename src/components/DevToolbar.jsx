// src/components/DevToolbar.jsx
// @ts-nocheck

import React from "react";
import { DOG_STORAGE_KEY } from "@/redux/dogSlice.js";
import { auth } from "@/firebase.js";

function devLog(...args) {
  // small helper so we can mute this later if we want
  console.info("[DOGGERZ DEV]", ...args);
}

async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) {
    alert("No service worker support in this browser.");
    return;
  }

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (!regs.length) {
      alert("No service workers registered.");
      return;
    }

    await Promise.all(regs.map((r) => r.unregister()));
    devLog("Service workers unregistered.");
    alert("Service workers unregistered. Reloading…");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to unregister service worker. Check console.");
  }
}

function resetDogState() {
  try {
    localStorage.removeItem(DOG_STORAGE_KEY);
    devLog("Cleared dog state from localStorage:", DOG_STORAGE_KEY);
    alert("Dog state reset. Reloading…");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to reset dog state. Check console.");
  }
}

async function clearUserState() {
  try {
    // whatever you ended up using for user cache
    localStorage.removeItem("DOGGERZ_USER");
    localStorage.removeItem("DOGGERZ_PROFILE");

    // Try a best-effort Firebase sign-out without assuming API shape
    try {
      if (auth && typeof auth.signOut === "function") {
        await auth.signOut();
        devLog("Signed out via auth.signOut().");
      }
    } catch {
      // ignore – different firebase API shape
    }

    devLog("Cleared local user cache.");
    alert("User state cleared. Reloading…");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to clear user state. Check console.");
  }
}

function addTestCoins() {
  // We don't know your exact Redux action name here, so we just log.
  // You can wire this to a real dispatch later.
  devLog("TODO: wire +100 coins dev action.");
  alert("+100 coins dev hook is not wired yet (needs slice action).");
}

function testLevelUp() {
  devLog("TODO: wire Test Level-Up dev action.");
  alert("Test Level-Up dev hook is not wired yet (needs slice action).");
}

export default function DevToolbar() {
  // Only show in dev builds; in a production build this vanishes
  if (!import.meta.env.DEV) return null;

  const btnBase =
    "inline-flex items-center rounded px-2.5 py-1 text-[0.7rem] font-medium " +
    "border border-amber-700/80 bg-amber-900/70 hover:bg-amber-800/90 " +
    "hover:border-amber-500/80 transition whitespace-nowrap";

  return (
    <div className="w-full bg-amber-950 text-amber-100 text-xs border-b border-amber-800">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 overflow-x-auto">
        <span className="inline-flex items-center rounded bg-amber-700 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
          DEV
        </span>

        <button type="button" className={btnBase} onClick={unregisterServiceWorkers}>
          Unregister SW
        </button>

        <button type="button" className={btnBase} onClick={resetDogState}>
          Reset Dog
        </button>

        <button type="button" className={btnBase} onClick={clearUserState}>
          Clear User
        </button>

        <button type="button" className={btnBase} onClick={addTestCoins}>
          +100 Coins
        </button>

        <button type="button" className={btnBase} onClick={testLevelUp}>
          Test Level-Up
        </button>
      </div>
    </div>
  );
}
