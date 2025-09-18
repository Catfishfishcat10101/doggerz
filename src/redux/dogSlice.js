/* ------------------------------- Selectors ---------------------------------- */
export const selectDog          = (state) => state.dog;
export const selectDogLevel     = (state) => state.dog.level;
export const selectDogNeeds     = (state) => state.dog.needs;

export const selectCoins        = (state) => state.dog.coins;
export const selectXP           = (state) => state.dog.xp;
export const selectHappiness    = (state) => state.dog.happiness;

export const selectAccessories  = (state) => state.dog.accessories;
export const selectUnlocks      = (state) => state.dog.unlocks;

export const selectDirection    = (state) => state.dog.direction;
export const selectMoving       = (state) => state.dog.moving;

/** ✅ The one causing the error */
export const selectPos          = (state) => state.dog.pos;

/** Optional aliases (helpful if some files import different names) */
export const selectPosition     = (state) => state.dog.pos;
export const selectDogPos       = (state) => state.dog.pos;

export const selectBackyardSkin = (state) => state.dog.backyardSkin;

/* If you also keep selectors in src/redux/dogSelectors.js and want to expose them
   through this module, you can re-export them. Only do this if there are no
   duplicate names in both files. Otherwise, skip this line. */
// export * from "./dogSelectors";

export default slice.reducer;