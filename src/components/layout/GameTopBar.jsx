import { Settings, Coins, Gem, Star } from "lucide-react";

const DEFAULT_DOG_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23111c16'/%3E%3Cstop offset='100%25' stop-color='%23233722'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='32' fill='url(%23bg)'/%3E%3Cellipse cx='32' cy='38' rx='18' ry='14' fill='%23f4e7c8'/%3E%3Ccircle cx='23' cy='23' r='8' fill='%23f4e7c8'/%3E%3Ccircle cx='41' cy='23' r='8' fill='%238b5a3c'/%3E%3Cpath d='M18 16l4-9 6 8' fill='%23f4e7c8'/%3E%3Cpath d='M46 16l-4-9-6 8' fill='%238b5a3c'/%3E%3Ccircle cx='28' cy='34' r='2.2' fill='%2311171a'/%3E%3Ccircle cx='38' cy='34' r='2.2' fill='%2311171a'/%3E%3Cellipse cx='33' cy='40' rx='4' ry='3' fill='%2311171a'/%3E%3Cpath d='M28 45c3 3 7 3 10 0' stroke='%2311171a' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

function normalizeText(value = "") {
  return String(value || "").trim();
}

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
<<<<<<< HEAD
=======
  healthPct = null,
  bondPct = null,
>>>>>>> 10f88903 (chore: remove committed backup folders)
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
  const normalizedSaveLabel = normalizeText(saveLabel);
  const normalizedSaveDetail = normalizeText(saveDetail);
  const showSaveDetail =
    normalizedSaveDetail &&
    normalizedSaveDetail.toLowerCase() !== normalizedSaveLabel.toLowerCase();
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
<<<<<<< HEAD
    <header className="sticky top-0 z-[60] px-3 pt-[max(env(safe-area-inset-top),10px)] pb-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 rounded-[22px] border border-white/10 bg-[#11161c]/95 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.34)] backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-lime-400/80 bg-[#1b232c] shadow-[0_0_0_3px_rgba(132,204,22,0.12)]">
=======
    <header className="sticky top-0 z-[60] px-2 pt-[max(env(safe-area-inset-top),8px)] pb-1 sm:px-3 sm:pt-[max(env(safe-area-inset-top),10px)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 rounded-[20px] border border-emerald-300/14 bg-[#10161c]/94 px-2.5 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.34),0_0_34px_rgba(52,211,153,0.08)] backdrop-blur-md sm:gap-1.5 sm:rounded-[22px] sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-lime-400/80 bg-[#1b232c] shadow-[0_0_0_3px_rgba(132,204,22,0.12)] sm:h-14 sm:w-14">
>>>>>>> 10f88903 (chore: remove committed backup folders)
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

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
<<<<<<< HEAD
              <p className="min-w-0 truncate text-sm font-extrabold uppercase tracking-wide text-lime-300">
                {dogName}
              </p>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/72">
                {dogStage}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${conditionToneClass}`}
=======
              <p className="min-w-0 truncate text-sm font-extrabold uppercase tracking-wide text-lime-300 sm:text-sm">
                {dogName}
              </p>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/72 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {dogStage}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] sm:px-2.5 sm:py-1 sm:text-[10px] ${conditionToneClass}`}
>>>>>>> 10f88903 (chore: remove committed backup folders)
              >
                {conditionLabel}
              </span>
            </div>
            {conditionHint ? (
<<<<<<< HEAD
              <p className="mt-1 truncate text-[10px] font-semibold text-white/55">
=======
              <p className="mt-0.5 max-w-[15rem] truncate text-[10px] font-semibold text-white/55 sm:mt-1 sm:max-w-none">
>>>>>>> 10f88903 (chore: remove committed backup folders)
                {conditionHint}
              </p>
            ) : null}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 self-start">
            <button
              type="button"
              onClick={onOpenSettings}
<<<<<<< HEAD
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-[0.98]"
=======
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-[0.98] sm:h-10 sm:w-10"
>>>>>>> 10f88903 (chore: remove committed backup folders)
              aria-label="Open settings"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={onOpenShop}
<<<<<<< HEAD
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-lime-300/30 bg-gradient-to-b from-lime-400 to-lime-500 px-3.5 text-sm font-extrabold uppercase tracking-wide text-[#101510] shadow-[0_8px_20px_rgba(132,204,22,0.35)] transition hover:brightness-105 active:scale-[0.98]"
=======
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-lime-300/30 bg-gradient-to-b from-lime-400 to-lime-500 px-3 text-xs font-extrabold uppercase tracking-wide text-[#101510] shadow-[0_8px_20px_rgba(132,204,22,0.35)] transition hover:brightness-105 active:scale-[0.98] sm:h-10 sm:px-3.5 sm:text-sm"
>>>>>>> 10f88903 (chore: remove committed backup folders)
            >
              Shop
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
<<<<<<< HEAD
          <div className="flex flex-wrap items-center gap-1.5">
=======
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:items-center">
            <MiniStat
              icon={<span aria-hidden="true">H</span>}
              label="Health"
              value={
                Number.isFinite(Number(healthPct))
                  ? `${Math.round(Number(healthPct))}%`
                  : "OK"
              }
            />
            <MiniStat
              icon={<span aria-hidden="true">B</span>}
              label="Bond"
              value={
                Number.isFinite(Number(bondPct))
                  ? `${Math.round(Number(bondPct))}%`
                  : "New"
              }
            />
>>>>>>> 10f88903 (chore: remove committed backup folders)
            <MiniStat
              icon={<Star className="h-3.5 w-3.5" />}
              label="Level"
              value={`Lv ${level}`}
<<<<<<< HEAD
=======
              className="hidden sm:inline-flex"
>>>>>>> 10f88903 (chore: remove committed backup folders)
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
<<<<<<< HEAD
            />
            <span
              className={`inline-flex h-9 items-center rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.14em] ${saveToneClass}`}
=======
              className="hidden sm:inline-flex"
            />
            <span
              className={`hidden h-9 items-center rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline-flex ${saveToneClass}`}
>>>>>>> 10f88903 (chore: remove committed backup folders)
            >
              {normalizedSaveLabel}
            </span>
            {showSaveDetail ? (
<<<<<<< HEAD
              <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[10px] font-bold tracking-[0.08em] text-white/70">
=======
              <span className="hidden h-9 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[10px] font-bold tracking-[0.08em] text-white/70 sm:inline-flex">
>>>>>>> 10f88903 (chore: remove committed backup folders)
                {normalizedSaveDetail}
              </span>
            ) : null}
            {saveHint ? (
<<<<<<< HEAD
              <span className="w-full pl-1 text-[10px] font-semibold text-white/55">
=======
              <span className="hidden w-full pl-1 text-[10px] font-semibold text-white/55 sm:block">
>>>>>>> 10f88903 (chore: remove committed backup folders)
                {saveHint}
              </span>
            ) : null}
          </div>
<<<<<<< HEAD
          <div className="rounded-[18px] border border-white/8 bg-black/25 px-2.5 py-2">
=======
          <div className="hidden rounded-[18px] border border-white/8 bg-black/25 px-2.5 py-2 sm:block">
>>>>>>> 10f88903 (chore: remove committed backup folders)
            <div className="flex items-center justify-between pb-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
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

<<<<<<< HEAD
function MiniStat({ icon, label, value }) {
  return (
    <div className="inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3">
      <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
        {icon}
      </div>
      <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
        {label}
      </p>
      <p className="truncate text-sm font-extrabold text-white">{value}</p>
=======
function MiniStat({ icon, label, value, className = "" }) {
  return (
    <div
      className={`inline-flex h-9 min-w-0 items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 sm:gap-2 sm:rounded-full sm:px-3 ${className}`.trim()}
    >
      <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
        {icon}
      </div>
      <p className="hidden truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 sm:block">
        {label}
      </p>
      <p className="min-w-0 truncate text-sm font-extrabold text-white">
        {value}
      </p>
>>>>>>> 10f88903 (chore: remove committed backup folders)
    </div>
  );
}
