import { createAsyncThunk } from "@reduxjs/toolkit";
import { adoptDog, setDog, resetDog, simulationTick } from "./dogSlice";

// --- Mock Firebase/Firestore Integration ---
// In a real app, these would interact with Firebase Firestore.
// For this phase, we'll simulate persistence with localStorage.
const DOG_PERSISTENCE_KEY = "doggerz:dogState";

const mockSaveDogToFirestore = async (dogState) => {
  console.log(
    "Mock: Saving dog state to Firestore (localStorage)...",
    dogState
  );
  localStorage.setItem(DOG_PERSISTENCE_KEY, JSON.stringify(dogState));
  return dogState;
};

const mockLoadDogFromFirestore = async () => {
  console.log("Mock: Loading dog state from Firestore (localStorage)...");
  const storedState = localStorage.getItem(DOG_PERSISTENCE_KEY);
  if (storedState) {
    try {
      const dog = JSON.parse(storedState);
      // Ensure lastUpdatedAt is a number for simulationTick
      if (dog && typeof dog.lastUpdatedAt === "string") {
        dog.lastUpdatedAt = new Date(dog.lastUpdatedAt).getTime();
      }
      return dog;
    } catch (e) {
      console.error("Failed to parse stored dog state:", e);
      localStorage.removeItem(DOG_PERSISTENCE_KEY); // Clear corrupted data
      return null;
    }
  }
  return null;
};

const mockDeleteDogFromFirestore = async () => {
  console.log("Mock: Deleting dog state from Firestore (localStorage)...");
  localStorage.removeItem(DOG_PERSISTENCE_KEY);
};

// --- Async Thunks ---

export const adoptPup = createAsyncThunk(
  "dog/adoptPup",
  async ({ name, now }, { dispatch }) => {
    const adoptedAt = now;
    const newDogState = { name, adoptedAt, now };
    dispatch(adoptDog(newDogState));
    const currentState = dispatch(simulationTick({ now })).payload; // Apply initial tick
    await mockSaveDogToFirestore(currentState);
    return currentState;
  }
);

export const loadDogState = createAsyncThunk(
  "dog/loadDogState",
  async (_, { dispatch }) => {
    const storedDog = await mockLoadDogFromFirestore();
    if (storedDog) {
      dispatch(setDog(storedDog));
      dispatch(simulationTick({ now: Date.now() })); // Apply tick to update stats based on elapsed time
      return storedDog;
    }
    return null;
  }
);

export const saveDogState = createAsyncThunk(
  "dog/saveDogState",
  async (_, { getState }) => {
    const dogState = getState().dog;
    await mockSaveDogToFirestore(dogState);
    return dogState;
  }
);

export const deleteDog = createAsyncThunk(
  "dog/deleteDog",
  async (_, { dispatch }) => {
    await mockDeleteDogFromFirestore();
    dispatch(resetDog());
  }
);
