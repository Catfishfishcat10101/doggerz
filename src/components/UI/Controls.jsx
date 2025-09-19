// src/components/UI/Controls.jsx
import React, { useEffect, useMemo, useState } from "react";
import useKeyPressed from "../../hooks/useKeyPressed";

export default function Controls({
  onBark,
  onPet,
  onSpeedNormal,
  onSpeedFast,
  showTouch: showTouchProp,
}) {
  const [open, setOpen] = useLocalStorage("controls_open", true);
  const [copied, setCopied] = useState(false);
  const [hasGamepad, setHasGamepad] = useState(false);

  // Live key state
  const left = useKeyPressed(["arrowleft", "a"]);
  const right = useKeyPressed(["arrowright", "d"]);
  const up = useKeyPressed(["arrowup", "w"]);
  const down = useKeyPressed(["arrowdown", "s"]);
  const bark = useKeyPressed(["b"]);
  const dot = useKeyPressed(["."]);
  const shift = useKeyPressed(["shift"]);

  // Gamepad presence
  useEffect(() => {
    const update = () => {
      const pads = navigator.getGamepads?.() || [];
      setHasGamepad(pads.some((p) => p && p.connected));
    };
    update();
    window.addEventListener("gamepadconnected", update);
    window.addEventListener("gamepaddisconnected", update);
    const id = setInterval(update, 1000);
    return () => {
      clearInterval(id);
      window.removeEventListener("gamepadconnected", update);
      window.removeEventListener("gamepaddisconnected", update);
    };
  }, []);

  // Default to touch controls on narrow screens
  const showTouch = useMemo(() => {
    if (typeof showTouchProp === "boolean") return showTouchProp;
    return window.matchMedia?.("(max-width: 768px)")?.matches ?? false;
  }, [showTouchProp]);

  const copyText = `Controls:
- Move: Arrow Keys / WASD
- Bark: B
- Time: "." (normal), "Shift + ." (fast)
- Pet: hold Pet button`;

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-4 text-sm text-emerald-900 border border-emerald-900/10">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Controls</span>
            <Badge muted={!hasGamepad} title={hasGamepad ? "Gamepad connected" : "Plug a controller"}>
              🎮 {hasGamepad ? "Gamepad" : "No Gamepad"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(copyText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {}
              }}
              className="px-2.5 py-1.5 rounded-lg border hover:bg-slate-50"
              title="Copy shortcuts"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="px-2.5 py-1.5 rounded-lg border hover:bg-slate-50"
              aria-expanded={open}
              aria-controls="controls-panel"
            >
              {open ? "Hide" : "Show"}
            </button>
          </div>
        </header>

        {open && (
          <div id="controls-panel" className="mt-3 grid gap-3">
            {/* Move */}
            <Row label="Move" active={up || down || left || right}>
              <KeyRow keys={["W", "A", "S", "D"]} />
              <KeyRow keys={["↑", "←", "↓", "→"]} />
            </Row>

            {/* Bark */}
            <Row label="Bark" active={bark} action={() => onBark?.()}>
              <KeyRow keys={["B"]} />
            </Row>

            {/* Time */}
            <Row label="Time Speed" active={dot || shift}>
              <KeyRow keys={["."]} label="Normal" onClick={() => onSpeedNormal?.()} />
              <KeyRow keys={["Shift", "."]} label="Fast" onClick={() => onSpeedFast?.()} />
            </Row>

            {/* Pet */}
            <Row label="Pet" active={false}>
              <div className="text-emerald-900/70 text-xs">
                Hold the <em>Pet</em> button in the HUD to earn XP & happiness.
              </div>
            </Row>

            {/* Touch controls (mobile) */}
            {showTouch && (
              <div className="grid grid-cols-2 gap-2">
                <TouchPad />
                <ActionPanel
                  onBark={onBark}
                  onPet={onPet}
                  onSpeedNormal={onSpeedNormal}
                  onSpeedFast={onSpeedFast}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- primitives ---------- */

function Row({ label, active, children }) {
  return (
    <div className="rounded-xl border border-emerald-900/10 bg-white/60 px-3 py-2 flex items-start justify-between gap-3">
      <div className="min-w-24 font-medium">{label}</div>
      <div className="flex-1 grid gap-1">{children}</div>
      <Dot active={!!active} />
    </div>
  );
}

function KeyRow({ keys, label, onClick }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <kbd className="flex items-center flex-wrap gap-1">
        {keys.map((k, i) => (
          <span
            key={i}
            className={[
              "inline-flex items-center justify-center rounded-md border",
              "px-2 py-0.5 font-mono text-xs leading-5",
              "bg-white/80 border-emerald-900/20 shadow-sm",
            ].join(" ")}
          >
            {k}
          </span>
        ))}
      </kbd>
      {label && (
        <button
          onClick={onClick}
          className="text-emerald-900/70 text-xs font-medium hover:underline"
          type="button"
        >
          {label}
        </button>
      )}
    </div>
  );
}

function Badge({ children, muted = false, title }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs border",
        muted
          ? "bg-emerald-50 border-emerald-200 text-emerald-700/70"
          : "bg-emerald-100 border-emerald-300 text-emerald-800",
      ].join(" ")}
      title={title}
    >
      {children}
    </span>
  );
}

function Dot({ active }) {
  return (
    <span
      className={[
        "inline-block h-2.5 w-2.5 rounded-full",
        active ? "bg-emerald-600 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" : "bg-emerald-300",
      ].join(" ")}
      aria-label={active ? "Active" : "Inactive"}
    />
  );
}

/* ---------- touch controls ---------- */

function TouchPad() {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-3 select-none">
      <div className="text-xs font-semibold text-emerald-900/80 mb-2">D-Pad</div>
      <div className="relative h-32 grid grid-cols-3 grid-rows-3 gap-2">
        <PadBtn label="↑" col={2} row={1} />
        <PadBtn label="←" col={1} row={2} />
        <PadBtn label="→" col={3} row={2} />
        <PadBtn label="↓" col={2} row={3} />
      </div>
      <p className="text-[10px] mt-2 text-emerald-900/60">Hold to move • experimental</p>
    </div>
  );
}

function PadBtn({ label, col, row }) {
  return (
    <button
      className="rounded-lg bg-white border border-emerald-900/10 py-3 text-lg active:scale-95 shadow-sm"
      style={{ gridColumn: String(col), gridRow: String(row) }}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label}
      type="button"
    >
      {label}
    </button>
  );
}

function ActionPanel({ onBark, onPet, onSpeedNormal, onSpeedFast }) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white/60 p-3">
      <div className="text-xs font-semibold text-emerald-900/80 mb-2">Actions</div>
      <div className="flex flex-wrap gap-2">
        <ActionBtn onClick={onBark} title="Bark (B)">🗣️ Bark</ActionBtn>
        <ActionBtn onMouseDown={onPet} onTouchStart={onPet} title="Hold to Pet">🐶 Pet</ActionBtn>
        <ActionBtn onClick={onSpeedNormal} title="Normal time (.)">⏱️ Normal</ActionBtn>
        <ActionBtn onClick={onSpeedFast} title="Fast time (Shift+.)">⚡ Fast</ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn(props) {
  return (
    <button
      {...props}
      className="px-3 py-2 text-sm rounded-xl bg-white border border-emerald-900/10 shadow hover:shadow-md active:scale-95"
      onContextMenu={(e) => e.preventDefault()}
      type="button"
    />
  );
}

/* ---------- tiny localStorage hook ---------- */
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}
