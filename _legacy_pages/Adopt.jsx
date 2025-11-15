// src/pages/Adopt.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { getMyDogDoc, adoptDog } from "../utils/firebase/dogService";

export default function Adopt() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      if (!auth.currentUser) {
        nav("/login", { replace: true, state: { from: { pathname: "/adopt" } } });
        return;
      }
      const existing = await getMyDogDoc();
      if (existing) nav("/game", { replace: true });
    })();
  }, [nav]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await adoptDog(name.trim());
    nav("/game");
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-stone-950 text-white">
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold">Name your dog</h2>
        <input
          className="mt-6 w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 outline-none"
          placeholder="e.g., Fireball"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold disabled:opacity-50"
        >
          {busy ? "Adopting…" : "Adopt"}
        </button>
      </form>
    </div>
  );
}