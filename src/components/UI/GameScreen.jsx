import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";
import { selectDog } from "@/redux/dogSlice";
import PupStage from "./PupStage.jsx";

export default function GameScreen() {
  const user = useSelector(selectUser);
  const dog  = useSelector(selectDog);

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          {dog.name ? `${dog.name} the Pup` : "Your Pup"}
        </h1>
        <div className="text-sm text-slate-300">Signed in as {user?.email}</div>
      </header>

      <PupStage />

      <p className="text-sm text-slate-400">
        Tip: Tap/click to bark. Use A/D or Left/Right to move.
      </p>
    </div>
  );
}
