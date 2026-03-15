import { tickDogPolls } from "@/store/dogSlice.js";

export const DOG_ENGINE_START = "engine/START";
export const DOG_ENGINE_STOP = "engine/STOP";
export const DOG_ENGINE_TICK = "engine/TICK";
export const DOG_ENGINE_TICK_INTERVAL_MS = 60_000;

export const startDogTickEngine = () => ({ type: DOG_ENGINE_START });
export const stopDogTickEngine = () => ({ type: DOG_ENGINE_STOP });

function canTickNow() {
  if (typeof document === "undefined") return true;
  return !document.hidden;
}

export const dogTickMiddleware = (storeApi) => {
  let tickInterval = null;

  const clearTickInterval = () => {
    if (!tickInterval) return;
    clearInterval(tickInterval);
    tickInterval = null;
  };

  const runTick = () => {
    if (!canTickNow()) return;
    const now = Date.now();
    storeApi.dispatch({
      type: DOG_ENGINE_TICK,
      payload: {
        now,
        source: "redux_heartbeat",
      },
    });
    storeApi.dispatch(tickDogPolls({ now }));
  };

  return (next) => (action) => {
    if (action?.type === DOG_ENGINE_START && !tickInterval) {
      tickInterval = setInterval(runTick, DOG_ENGINE_TICK_INTERVAL_MS);
    }

    if (action?.type === DOG_ENGINE_STOP) {
      clearTickInterval();
    }

    return next(action);
  };
};

export default dogTickMiddleware;
