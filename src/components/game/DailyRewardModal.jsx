export default function DailyRewardModal({ streak, onClaim, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/68 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[2rem] border border-white/20 bg-slate-900 p-5 shadow-soft">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              Daily Reward
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              {streak || 1}-day streak. Keep it going.
            </h2>

            <p className="mt-2 text-sm font-bold text-slate-300">
              Today&apos;s reward: 100 Coins.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-black text-white"
          >
            Hide
          </button>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Current Streak
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {streak || 1} days
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onClaim}
            className="doggerz-button doggerz-button-primary"
          >
            Claim
          </button>

          <button
            type="button"
            onClick={onClaim}
            className="doggerz-button border border-amber-300/35 bg-amber-400/20 text-amber-100"
          >
            Claim Double Later
          </button>

          <button
            type="button"
            onClick={onClose}
            className="doggerz-button doggerz-button-ghost"
          >
            Later
          </button>
        </div>
      </section>
    </div>
  );
}
