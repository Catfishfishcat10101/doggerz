// src/redux/dogSelectors.js
export const selectDog = (s) => s.dog;
export const selectDogState = (s) => ({
happiness: s.dog.hapiness,
energy: s.dog.energy,
hunger: s.dog.hunger,
});
export const selectDogLevel = (s) => s.dog.level ?? 1;
