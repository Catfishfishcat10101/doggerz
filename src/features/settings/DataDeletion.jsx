import { deleteUser } from "firebase/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { SUPPORT_EMAIL_ACCOUNT_DELETION_URL } from "@/app/config/links.js";
import { auth } from "@/lib/firebase/index.js";
import { deleteDogFromCloud } from "@/store/dogThunks.js";
import { resetDogState } from "@/store/dogSlice.js";
import { clearUserAuth } from "@/store/userSlice.js";
import { listStoredKeys, removeStoredValues } from "@/utils/nativeStorage.js";

async function clearLocalDoggerzData() {
  const keys = await listStoredKeys();
  const doggerzKeys = keys.filter((key) =>
    String(key || "").startsWith("doggerz:")
  );
  await removeStoredValues([...doggerzKeys, "theme"]);
}

export default function DataDeletion() {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handleDeleteCloudSave() {
    const ok = window.confirm(
      "Delete your Doggerz cloud save for this account? Local data on this device will stay unless you clear it below."
    );
    if (!ok) return;

    setBusy(true);
    setStatus("");
    try {
      await dispatch(deleteDogFromCloud()).unwrap();
      setStatus("Cloud save deleted.");
    } catch (error) {
      setStatus(
        String(
          error || "Cloud save deletion failed. Try again or contact support."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const ok = window.confirm(
      "Permanently delete this Firebase account and Doggerz cloud save? This may require a recent login."
    );
    if (!ok) return;

    setBusy(true);
    setStatus("");
    try {
      await dispatch(deleteDogFromCloud())
        .unwrap()
        .catch(() => null);
      const user = auth?.currentUser || null;
      if (!user) throw new Error("No signed-in account was found.");
      await deleteUser(user);
      dispatch(clearUserAuth());
      setStatus(
        "Account deleted. Local data remains on this device until cleared."
      );
    } catch (error) {
      setStatus(
        String(
          error?.code === "auth/requires-recent-login"
            ? "Account deletion needs a fresh login. Sign out, sign back in, then try again."
            : error?.message ||
                "Account deletion failed. Contact support if it continues."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleClearLocalData() {
    const ok = window.confirm(
      "Clear all local Doggerz data on this device? Cloud data is not deleted by this action."
    );
    if (!ok) return;

    setBusy(true);
    setStatus("");
    try {
      await clearLocalDoggerzData();
      dispatch(resetDogState());
      setStatus("Local Doggerz data cleared. Reloading...");
      window.setTimeout(() => window.location.reload(), 350);
    } catch {
      setStatus("Local data could not be cleared on this device.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
      <div className="text-sm font-black text-red-100">Data deletion</div>
      <p className="mt-1 text-xs leading-5 text-doggerz-paw/75">
        Play Store account deletion must be available in-app. Use these controls
        to remove cloud save data, the signed-in account, or local device data.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleDeleteCloudSave}
          className="dz-touch-button rounded-xl border border-red-300/35 bg-black/25 px-3 py-2 text-xs font-bold text-red-100 hover:bg-red-500/10 disabled:opacity-60"
        >
          Delete cloud save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDeleteAccount}
          className="dz-touch-button rounded-xl bg-red-500/90 px-3 py-2 text-xs font-bold text-white hover:bg-red-400 disabled:opacity-60"
        >
          Delete account
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleClearLocalData}
          className="dz-touch-button rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-xs font-bold text-doggerz-bone hover:border-doggerz-leaf/60 disabled:opacity-60"
        >
          Clear local data
        </button>
      </div>

      <a
        href={SUPPORT_EMAIL_ACCOUNT_DELETION_URL}
        className="mt-3 inline-flex text-xs font-semibold text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
      >
        Request deletion by email
      </a>

      {status ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-doggerz-bone">
          {status}
        </p>
      ) : null}
    </section>
  );
}
