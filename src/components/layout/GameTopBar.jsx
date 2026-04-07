import { Settings, Coins, Gem, Star } from "lucide-react";

const DEFAULT_DOG_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23111c16'/%3E%3Cstop offset='100%25' stop-color='%23233722'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='32' fill='url(%23bg)'/%3E%3Cellipse cx='32' cy='38' rx='18' ry='14' fill='%23f4e7c8'/%3E%3Ccircle cx='23' cy='23' r='8' fill='%23f4e7c8'/%3E%3Ccircle cx='41' cy='23' r='8' fill='%238b5a3c'/%3E%3Cpath d='M18 16l4-9 6 8' fill='%23f4e7c8'/%3E%3Cpath d='M46 16l-4-9-6 8' fill='%238b5a3c'/%3E%3Ccircle cx='28' cy='34' r='2.2' fill='%2311171a'/%3E%3Ccircle cx='38' cy='34' r='2.2' fill='%2311171a'/%3E%3Cellipse cx='33' cy='40' rx='4' ry='3' fill='%2311171a'/%3E%3Cpath d='M28 45c3 3 7 3 10 0' stroke='%2311171a' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

export default function GameTopBar({
  dogName = "",
  dogStage = "Puppy",
  conditionLabel = "Content",
  conditionTone = "emerald",
  conditionHint = "",
  avatarSrc = DEFAULT_DOG_AVATAR,
  coins = 1250,
  gems = 8,
  level = 4,
  xp = 72,
  xpMax = 100,
  saveLabel = "Local save",
  saveDetail = "Saved on this device",
  saveTone = "muted",
  saveHint = "",
  onOpenSettings = () => {},
  onOpenShop = () => {},
}) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const safeXpMax = Math.max(1, Number(xpMax) || 1);
  const xpPercent = Math.max(0, Math.min(100, (safeXp / safeXpMax) * 100));
  const conditionToneClass =
    String(conditionTone || "").toLowerCase() === "danger"
      ? "border-rose-300/35 bg-rose-400/12 text-rose-50"
      : String(conditionTone || "").toLowerCase() === "warning"
        ? "border-amber-300/35 bg-amber-400/12 text-amber-50"
        : String(conditionTone || "").toLowerCase() === "sky"
          ? "border-sky-300/35 bg-sky-400/12 text-sky-50"
          : "border-emerald-300/35 bg-emerald-400/12 text-emerald-50";
  const saveToneClass =
    String(saveTone || "").toLowerCase() === "ok"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50"
      : String(saveTone || "").toLowerCase() === "warning" ||
          String(saveTone || "").toLowerCase() === "pending"
        ? "border-amber-300/30 bg-amber-400/10 text-amber-50"
        : "border-white/12 bg-white/5 text-white/85";

  return (
    <header className="sticky top-0 z-[60] px-3 pt-[max(env(safe-area-inset-top),10px)] pb-1.5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 rounded-[24px] border border-white/10 bg-[#11161c]/95 px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-lime-400/80 bg-[#1b232c] shadow-[0_0_0_4px_rgba(132,204,22,0.12)]">
            <img
              src={avatarSrc}
              alt={`${dogName} avatar`}
              className="h-full w-full object-cover"
              draggable="false"
              onError={(event) => {
                if (event.currentTarget.src !== DEFAULT_DOG_AVATAR) {
                  event.currentTarget.src = DEFAULT_DOG_AVATAR;
                }
              }}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold uppercase tracking-wide text-lime-300">
              {dogName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white/70">
              <span>{dogStage}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${conditionToneClass}`}
              >
                {conditionLabel}
              </span>
            </div>
            {conditionHint ? (
              <p className="mt-0.5 truncate text-[10px] font-semibold text-white/55">
                {conditionHint}
              </p>
            ) : null}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-[0.98]"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="rounded-2xl border border-lime-300/30 bg-gradient-to-b from-lime-400 to-lime-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-[#101510] shadow-[0_8px_20px_rgba(132,204,22,0.35)] transition hover:brightness-105 active:scale-[0.98]"
            >
              Shop
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <MiniStat
              icon={<Star className="h-3.5 w-3.5" />}
              label="Level"
              value={`Lv ${level}`}
            />
            <MiniStat
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Coins"
              value={coins.toLocaleString()}
            />
            <MiniStat
              icon={<Gem className="h-3.5 w-3.5" />}
              label="Gems"
              value={gems.toLocaleString()}
            />
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${saveToneClass}`}
            >
              {saveLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-white/70">
              {saveDetail}
            </span>
            {saveHint ? (
              <span className="w-full text-[10px] font-semibold text-white/55">
                {saveHint}
              </span>
            ) : null}
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${conditionToneClass}`}
            >
              {conditionLabel}
            </span>
          </div>
          <div className="rounded-full bg-black/30 p-1">
            <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
              <span>XP</span>
              <span>
                {Math.round(safeXp)}/{Math.round(safeXpMax)}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-400 transition-[width] duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
        {icon}
      </div>
      <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
        {label}
      </p>
      <p className="truncate text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}
