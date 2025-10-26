// src/redux/dogThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ensureDogForUser, watchDog, nameDog } from "@/data/dogRepo";
import { dogHydrated } from "@redux/dogSlice";

export const bootstrapDog = createAsyncThunk(
  "dog/bootstrap",
  async (uid, { dispatch }) => {
    const dog = await ensureDogForUser(uid);
    dispatch(dogHydrated(dog));
    return dog;
  },
);

// elsewhere when the user is signed in:
let unsubscribeDog = null;
export function startDogWatch(uid, dispatch) {
  stopDogWatch(); // safety
  unsubscribeDog = watchDog(uid, (dog) => {
    dispatch({ type: "dog/received", payload: dog });
  });
}
export function stopDogWatch() {
  if (unsubscribeDog) {
    unsubscribeDog();
    unsubscribeDog = null;
  }
}
