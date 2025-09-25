import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Stub: no-op for now; wire to Firestore later
export default function FirebaseAutoSave() {
  const dog = useSelector((s) => s.dog);
  useEffect(() => {
    // TODO: debounce + save to Firestore if logged in
  }, [dog]);
  return null;
}
