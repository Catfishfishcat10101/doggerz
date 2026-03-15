import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { PATHS } from "@/app/routes.js";
import { resolveSessionSurprise } from "@/store/dogSlice.js";
import { buildHeistMessage, getHeistRouteLabel } from "@/utils/heistRoutes.js";

export default function HeistOverlay({ stolenAction = "", message = "" }) {
  const dispatch = useDispatch();
  const dogName = useSelector((state) => state?.dog?.name || "Fireball");
  const targetLabel = getHeistRouteLabel(stolenAction);
  const resolvedMessage =
    String(message || "").trim() || buildHeistMessage(stolenAction, dogName);

  return (
    <PageShell mainClassName="px-4 py-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center">
        <div className="w-full rounded-[32px] border border-amber-300/25 bg-black/55 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.48)] backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-200/85">
            Button Heist
          </div>
          <h1 className="mt-3 text-3xl font-black text-amber-100">
            {dogName} stole the {targetLabel.toLowerCase()} route
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {resolvedMessage}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-zinc-300">
            This screen stays locked until you resolve the heist.
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                dispatch(
                  resolveSessionSurprise({
                    now: Date.now(),
                    method: "fetch",
                  })
                )
              }
              className="btn-squish flex-1 rounded-2xl bg-[var(--accent-gold)] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-black"
            >
              Play fetch
            </button>
            <Link
              to={PATHS.GAME}
              className="btn-squish flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.16em] text-zinc-100"
            >
              Back to yard
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
