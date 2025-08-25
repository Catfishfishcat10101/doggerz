// src/redux/dogSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectDog = (state) => state.dog;

export const selectCoreStats = createSelector([selectDog], (d) => ({
      happiness: d.happiness,
        energy: d.energy,
          hunger: d.hunger,
}));

export const selectProgress = createSelector([selectDog], (d) => {
      const xpNeeded = 100; // keep in sync with your slice
        return {
                level: d.level,
                    xp: d.xp,
                        xpNeeded,
                            xpPct: Math.min(100, Math.round((d.xp / xpNeeded) * 100)),
        };
    });

    export const selectSpriteState = createSelector([selectDog], (d) => ({
          x: d.x, y: d.y,
            direction: d.direction,
              isWalking: d.isWalking || d.isRunning,
                isHappy: d.happiness > 70,
                  isDirty: d.isDirty,
                  }));

                  export const selectAlerts = createSelector([selectDog], (d) => {
                      const alerts = [];
                        if (d.hunger < 30) alerts.push({ type: "warn", msg: "Your pup is getting hungry." });
                          if (d.energy < 30) alerts.push({ type: "warn", msg: "Energy is low. Consider a nap." });
                            if (d.happiness < 30) alerts.push({ type: "info", msg: "Playtime would cheer your pup up." });
                              if (d.isDirty) alerts.push({ type: "info", msg: "Bath time! Pup is dirty." });
                                if (d.hasFleas) alerts.push({ type: "error", msg: "Your pup has fleas. Bathe soon!" });
                                  if (d.hasMange) alerts.push({ type: "error", msg: "Mange detected. Vet visit needed." });
                                    if (d.pottyLevel > 75 && !d.isPooping) alerts.push({ type: "info", msg: "Pup needs to potty." });
                                      return alerts;
                                      });
                  })
    }))
        }
})
}))