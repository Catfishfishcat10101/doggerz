import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";

import { auth, db, firebaseReady } from "@/lib/firebase/index.js";
import { dogMainDoc, userProfileDoc } from "@/lib/firebase/paths.js";
import { getDogStorageKey, resetDogState } from "@/store/dogSlice.js";
import { clearUser, USER_STORAGE_KEY } from "@/store/userSlice.js";
import { PATHS } from "@/app/routes.js";
import { useToast } from "@/state/toastContext.js";
import { removeStoredValue } from "@/utils/nativeStorage.js";

export default function DataDeletion() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");

  const handleDeleteAccount = async () => {
    if (!firebaseReady || !auth || !db) {
      setStatus("Cloud account deletion is unavailable right now.");
      return;
    }

    const user = auth.currentUser;
    if (!user?.uid) {
      setStatus("No signed-in account to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure? This permanently deletes your dog, your cloud save data, and your account."
    );
    if (!confirmed) return;

    const strictConfirm = window.prompt(
      "Type DELETE to permanently remove your Doggerz account and save data."
    );
    if (strictConfirm !== "DELETE") {
      setStatus("Account deletion canceled.");
      return;
    }

    setIsDeleting(true);
    setStatus("");

    try {
      const dogKey = getDogStorageKey(user.uid);

      // Best-effort cleanup for both older and current Firestore layouts.
      try {
        await deleteDoc(doc(db, "users", user.uid, "dog", "state"));
      } catch {
        // ignore
      }
      try {
        await deleteDoc(dogMainDoc(user.uid));
      } catch {
        // ignore
      }
      try {
        await deleteDoc(userProfileDoc(user.uid));
      } catch {
        // ignore
      }

      await deleteUser(user);

      try {
        await removeStoredValue(dogKey);
        await removeStoredValue(USER_STORAGE_KEY);
      } catch {
        // ignore local cleanup failures
      }

      dispatch(resetDogState());
      dispatch(clearUser());
      toast.success("Account and save data deleted.");
      navigate(PATHS.HOME, { replace: true });
    } catch (error) {
      console.error("[Doggerz] Deletion failed:", error);
      if (error?.code === "auth/requires-recent-login") {
        setStatus(
          "For security, please log out and log back in before deleting your account."
        );
      } else {
        setStatus("Failed to delete account. Please contact support.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-red-400/35 bg-red-950/20 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-red-200">
        Danger Zone
      </h3>
      <p className="mt-2 text-sm text-red-100/80">
        Permanently remove your dog, cloud save, and account data.
      </p>

      {status ? (
        <p className="mt-3 text-xs font-semibold text-red-100">{status}</p>
      ) : null}

      <button
        type="button"
        onClick={handleDeleteAccount}
        disabled={isDeleting}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
      >
        {isDeleting ? "Deleting Data..." : "Delete Account & Data"}
      </button>
    </div>
  );
}
