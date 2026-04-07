// src/components/ui/modals/modalRegistry.jsx

import DailyRewardModal from "@/components/ui/modals/DailyRewardModal.jsx";
import FounderBonusModal from "@/components/ui/modals/FounderBonusModal.jsx";
import LifecycleNoticeModal from "@/components/ui/modals/LifecycleNoticeModal.jsx";

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
