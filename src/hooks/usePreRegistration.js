// src/hooks/usePreRegistration.js
import { useCallback, useEffect, useState } from "react";

import {
  hasPreRegistrationRewardPurchase,
  PRE_REG_GIFT_COINS,
} from "@/features/billing/preRegistrationReward.js";
import { useDog } from "@/hooks/useDogState.js";
import { useAppDispatch } from "@/store/hooks.js";
import { grantPreRegGift } from "@/store/dogSlice.js";

/**
 * Resolves the player's pre-registration entitlement and exposes a one-time
 * founder reward claim action backed by the existing dog state.
 */
export function usePreRegistration({ enabled = true } = {}) {
  const dispatch = useAppDispatch();
  const dog = useDog();
  const adopted = Boolean(dog?.adoptedAt);
  const claimed = dog?.claimedPreReg === true;

  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(
    Boolean(enabled && adopted && !claimed)
  );

  useEffect(() => {
    if (!enabled || !adopted || claimed) {
      setIsEligible(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const checkEligibility = async () => {
      try {
        const eligible = await hasPreRegistrationRewardPurchase();
        if (cancelled) return;
        setIsEligible(Boolean(eligible));
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to verify pre-reg status", err);
          setIsEligible(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkEligibility();

    return () => {
      cancelled = true;
    };
  }, [adopted, claimed, enabled]);

  const claimReward = useCallback(
    ({ now = Date.now(), coins = PRE_REG_GIFT_COINS } = {}) => {
      if (!isEligible || claimed) return false;

      dispatch(
        grantPreRegGift({
          coins,
          now,
        })
      );
      return true;
    },
    [claimed, dispatch, isEligible]
  );

  return {
    isEligible,
    loading,
    claimReward,
    rewardAmount: PRE_REG_GIFT_COINS,
    claimed,
  };
}

export default usePreRegistration;
