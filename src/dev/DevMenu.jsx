import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotkey } from "./useHotkey";
import { resetDoggerzState } from "@/lib/resetState";

const isDev = import.meta.env.DEV;

export default function DevMenu() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useHotkey({ ctrl: true, key: "`" }, () => setOpen((v) => !v));

  if (!isDev || !open) return null;

  const Box = ({ children }) => (
    <div className="p-3 rounded-xl border border-zinc-700 bg-zinc-900/90">
      {children}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-[9999] text-sm text-zinc-200">
      <div className="grid gap-3 w-[320px]">
        <Box>
          <div className="font-semibold mb-2">Dev Menu</div>
          <div className="grid gap-2">
            <button
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-zinc-900 px-2 py-1"
              onClick={() => nav("/game")}
            >
              Go to /game
            </button>
            <button
              className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-2 py-1"
              onClick={() => nav("/")}
            >
              Go to /
            </button>
            <button
              className="rounded-md bg-rose-600/90 hover:bg-rose-500 px-2 py-1"
              onClick={resetDoggerzState}
              title="Clear doggerz-* localStorage keys and reload"
            >
              Reset App State
            </button>
          </div>
        </Box>

        <Box>
          <div className="opacity-80">
            <div>
              Build: <span className="font-mono">{import.meta.env.MODE}</span>
            </div>
            <div>
              Base: <span className="font-mono">{import.meta.env.BASE}</span>
            </div>
            <div>
              Vite:{" "}
              <span className="font-mono">
                {__vite__mapDeps ? "HMR" : "Prod"}
              </span>
            </div>
          </div>
        </Box>

        <button
          className="justify-self-end text-xs text-zinc-400 hover:text-zinc-200"
          onClick={() => setOpen(false)}
          aria-label="Close dev menu"
        >
          close
        </button>
      </div>
    </div>
  );
}
