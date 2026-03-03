import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  hydrateDog,
  registerSessionStart,
  selectDog,
  tickDog,
} from "@/redux/dogSlice.js";
import { loadDogState, saveDogState } from "@native/storage/dogStateStorage.js";

const AUTO_TICK_MS = 60 * 1000;
const SAVE_DEBOUNCE_MS = 500;

export default function useDogSession() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const hasBootedRef = useRef(false);

  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    let active = true;
    (async () => {
      const persistedDog = await loadDogState();
      if (!active) return;
      if (persistedDog) {
        dispatch(hydrateDog(persistedDog));
      }
      dispatch(registerSessionStart({ now: Date.now() }));
      setIsBootstrapped(true);
    })();

    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isBootstrapped) return undefined;
    const id = setInterval(() => {
      dispatch(tickDog({ now: Date.now() }));
    }, AUTO_TICK_MS);
    return () => clearInterval(id);
  }, [dispatch, isBootstrapped]);

  useEffect(() => {
    if (!isBootstrapped) return undefined;
    const id = setTimeout(() => {
      saveDogState(dog);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [dog, isBootstrapped]);

  return { dog, isBootstrapped };
}
