// src/hooks/useDogLifecycle.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { tick } from "@/store/dogSlice.js";

export function useDogLifecycle() {
  const dispatch = useDispatch();

  useEffect(() => {
    const id = setInterval(() => {
      dispatch(tick({ now: new Date().toISOString() }));
    }, 60000);
    return () => clearInterval(id);
  }, [dispatch]);
}
