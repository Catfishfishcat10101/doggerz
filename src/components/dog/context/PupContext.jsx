/* eslint-disable react-refresh/only-export-components */
// src/components/dog/context/PupContext.jsx
import * as React from "react";
import { useDispatch } from "react-redux";
import { addXp, goPotty, recordAccident, removeXp } from "@/store/dogSlice.js";
import { useDog } from "@/hooks/useDogState.js";

const PupContext = React.createContext(null);

export const usePup = () => {
  const context = React.useContext(PupContext);
  if (!context) throw new Error("usePup must be used within a PupProvider");
  return context;
};

export function PupProvider({ children }) {
  const dispatch = useDispatch();
  const dog = useDog();
  // Recalculate only when potty data changes.
  const pottyTrainingPct = React.useMemo(() => {
    const goal = dog.training?.potty?.goal || 0;
    const successes = dog.training?.potty?.successCount || 0;
    return goal ? Math.round((successes / goal) * 100) : 0;
  }, [dog.training?.potty]);

  const actions = React.useMemo(
    () => ({
      addXP: (amount) => dispatch(addXp({ amount })),
      removeXP: (amount) => dispatch(removeXp({ amount })),
      logPottySuccess: () =>
        dispatch(goPotty({ now: Date.now(), forceSuccess: true })),
      logAccident: () => dispatch(recordAccident({ now: Date.now() })),
      // Stubs for future expansion
      awardBadge: () => {},
    }),
    [dispatch]
  );

  const value = React.useMemo(
    () => ({
      pup: {
        ...dog,
        pottyTrainingPct,
      },
      ...actions,
    }),
    [dog, pottyTrainingPct, actions]
  );

  return <PupContext.Provider value={value}>{children}</PupContext.Provider>;
}
