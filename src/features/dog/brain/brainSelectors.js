import { createSelector } from "@reduxjs/toolkit";
import { selectDog } from "@/components/dog/redux/dogSelectors.js";
import { buildDogBrainState, evaluateDogBrain } from "./DogBrain.js";

export const selectDogBrainState = createSelector([selectDog], (dog) =>
  buildDogBrainState(dog)
);

export function selectDogBrainDecision(state, options = {}) {
  return evaluateDogBrain(selectDogBrainState(state), options);
}

export function getDogBrainDecisionFromDog(dog, options = {}) {
  return evaluateDogBrain(buildDogBrainState(dog), options);
}
