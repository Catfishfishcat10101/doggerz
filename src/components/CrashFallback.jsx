// src/components/CrashFallback.jsx

export default function CrashFallback({
  title = "Something went wrong",
  subtitle = "Try refreshing the page.",
  error,
  reset,
}) {
  const message = error?.message || "Unexpected error";
  const stack = error?.stack || "";
  const details = stack ? `${message}\n\n${stack}` : message;

  return (
    <div className="min-h-[60vh] grid place-items-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-5 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Error
        </div>
        <h1 className="mt-2 text-xl font-extrabold text-emerald-200">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>

        {error ? (
          <details className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200 text-left">
            <summary className="cursor-pointer text-[11px] font-semibold text-emerald-200">
              Error details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {details}
            </pre>
          </details>
        ) : null}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100"
          >
            Reload
          </button>
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-100"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
