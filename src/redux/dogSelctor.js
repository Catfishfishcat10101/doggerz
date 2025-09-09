// src/redux/dogSelectors.js
export const selectDog = (state) => state.dog;

export const selectDogName = (state) => state.dog?.name ?? "Pup";
export const selectDogAgeWeeks = (state) => state.dog?.ageWeeks ?? 0;

export const selectNeeds = (state) => ({
  hunger: state.dog?.hunger ?? 100,
  energy: state.dog?.energy ?? 100,
  happiness: state.dog?.happiness ?? 100,
  cleanliness: state.dog?.cleanliness ?? 100,
  bladder: state.dog?.bladder ?? 100,
});

export const selectLevel = (state) => state.dog?.level ?? 1;
export const selectXP = (state) => state.dog?.xp ?? 0;
export const selectMilestones = (state) => state.dog?.milestones ?? [];
export const selectKnownTricks = (state) => state.dog?.tricks ?? [];