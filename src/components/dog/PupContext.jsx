/** @format */
/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addXp, goPotty, recordAccident, selectDog } from "@/redux/dogSlice.js";

const PupContext = React.createContext(null);

export const usePup = () => {
  const context = React.useContext(PupContext);
  if (!context) throw new Error("usePup must be used within a PupProvider");
  return context;
};

export function PupProvider({ children }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // --- Optimized Selectors ---
  // We only re-calculate these when specific dog data changes to save battery
  const pottyTrainingPct = React.useMemo(() => {
    const goal = dog.training?.potty?.goal || 0;
    const successes = dog.training?.potty?.successCount || 0;
    return goal ? Math.round((successes / goal) * 100) : 0;
  }, [dog.training?.potty]);

  // --- Simplified Actions ---
  const actions = React.useMemo(
    () => ({
      addXP: (amount) => dispatch(addXp({ amount })),
      logPottySuccess: () => dispatch(goPotty({ now: Date.now() })),
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
