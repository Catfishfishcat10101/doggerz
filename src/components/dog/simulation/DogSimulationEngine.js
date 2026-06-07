// src/components/dog/simulation/DogSimulationEngine.js
import { simulationTick } from "@/store/dogSlice.js";

let intervalId = null;

export function startDogSimulation(store, intervalMs = 15_000) {
  if (!store || typeof store.dispatch !== "function") return;
  stopDogSimulation();
  intervalId = window.setInterval(() => {
    store.dispatch(simulationTick({ now: Date.now() }));
  }, intervalMs);
}

export function stopDogSimulation() {
  if (!intervalId) return;
  window.clearInterval(intervalId);
  intervalId = null;
}
