// src/components/ui/modals/modalRegistry.jsx

<<<<<<< HEAD
<<<<<<< HEAD
import DailyRewardModal from "@/components/ui/modals/DailyRewardModal.jsx";
import FounderBonusModal from "@/components/ui/modals/FounderBonusModal.jsx";
import LifecycleNoticeModal from "@/components/ui/modals/LifecycleNoticeModal.jsx";
=======
import { Suspense, lazy } from "react";

const DailyRewardModal = lazy(
  () => import("@/components/ui/modals/DailyRewardModal.jsx")
);
const FounderBonusModal = lazy(
  () => import("@/components/ui/modals/FounderBonusModal.jsx")
);
const LifecycleNoticeModal = lazy(
  () => import("@/components/ui/modals/LifecycleNoticeModal.jsx")
);
>>>>>>> 10f88903 (chore: remove committed backup folders)
=======
import DailyRewardModal from "@/components/ui/modals/DailyRewardModal.jsx";
import FounderBonusModal from "@/components/ui/modals/FounderBonusModal.jsx";
import LifecycleNoticeModal from "@/components/ui/modals/LifecycleNoticeModal.jsx";
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)

export function renderModal(entry, { closeModal } = {}) {
  const id = entry?.id ? String(entry.id) : "";
  const props =
    entry?.props && typeof entry.props === "object" ? entry.props : {};

  if (id === "dailyReward") {
    return (
      <DailyRewardModal
        open
        rewardState={props.rewardState || null}
        onClose={() => closeModal?.()}
      />
    );
  }

  if (id === "founderBonus") {
    return (
      <FounderBonusModal
        open
        rewardAmount={props.rewardAmount}
        onClaim={async () => {
          const ok = props?.onClaim ? await props.onClaim() : false;
          if (ok) closeModal?.();
        }}
        onClose={() => closeModal?.()}
      />
    );
  }

  if (id === "lifecycleNotice") {
    return (
      <LifecycleNoticeModal
        open
        lifecycleStatus={props.lifecycleStatus}
        dog={props.dog}
        onClose={() => closeModal?.()}
      />
    );
  }

  return null;
}
