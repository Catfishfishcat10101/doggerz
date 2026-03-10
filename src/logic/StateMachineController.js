import {
  DOG_FSM_DEFAULT,
  advanceDogFsm,
  applyFsmAction,
  ensureDogFsmState,
  isDogFsmLocked,
  transitionDogFsm,
} from "@/utils/dogFsm.js";

export {
  DOG_FSM_DEFAULT,
  advanceDogFsm,
  applyFsmAction,
  ensureDogFsmState,
  isDogFsmLocked,
  transitionDogFsm,
};

export const DogStateMachineController = Object.freeze({
  ensure: ensureDogFsmState,
  advance: advanceDogFsm,
  isLocked: isDogFsmLocked,
  applyAction: applyFsmAction,
  transition: transitionDogFsm,
  defaults: DOG_FSM_DEFAULT,
});
