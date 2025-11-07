// src/pages/Game.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { hydrateDog, selectDog } from "../redux/dogSlice";
import DogSprite from "../components/UI/DogSprite";

export default function Game() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const ref = doc(db, "dogs", u.uid);

    // Prime initial load
    getDoc(ref).then((snap) => {
      if (snap.exists()) dispatch(hydrateDog(snap.data()));
    });

    // Live sync
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) dispatch(hydrateDog(snap.data()));
    });
    return () => unsub();
  }, [dispatch]);

  return (
    <div className="min-h-dvh bg-stone-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{dog.name}</h2>
        <p className="mt-1 text-sm text-stone-300">Lv.{dog.level} • {dog.coins} coins</p>
        <div className="mt-6">
          <DogSprite src={"/sprites/jackrussell/idle.svg"} alt={dog.name} />
        </div>

        {/* Lightweight stat readout so you can verify data immediately */}
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs mx-auto text-left text-sm">
          {Object.entries(dog.stats).map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-lg p-2 flex items-center justify-between">
              <span className="capitalize">{k}</span>
              <span className="tabular-nums">{v}</span>
            </div>
          ))}
          <div className="bg-white/5 rounded-lg p-2 flex items-center justify-between col-span-2">
            <span>Potty level</span>
            <span className="tabular-nums">{dog.pottyLevel}{dog.isPottyTrained ? " ✅" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}