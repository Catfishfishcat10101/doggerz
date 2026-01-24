// src/components/CrashFallback.jsx

import * as React from "react";

function formatError(error) {
  try {
    if (!error) return "Unknown error";
    if (typeof error === "string") return error;
    const name = error.name ? String(error.name) : "Error";
    const message = error.message ? String(error.message) : "";
    const stack = error.stack ? String(error.stack) : "";
    return (
      [name, message].filter(Boolean).join(": ") + (stack ? `\n\n${stack}` : "")
    );
  } catch {
    return "Unknown error";
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }

  // Fallback for older browsers / restricted contexts.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CrashFallback({ title, subtitle, error, reset }) {
  const [copied, setCopied] = React.useState(false);
  const details = React.useMemo(() => formatError(error), [error]);

  const onCopy = React.useCallback(async () => {
    const ok = await copyText(details);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1200);
  }, [details]);

  return (
    <div className="min-h-[70vh] grid place-items-center bg-zinc-950 text-zinc-100 px-6 py-10">
      <div className="max-w-2xl w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="text-xl font-semibold">
          {title || "Something went wrong"}
        </div>
        {subtitle ? (
          <div className="mt-2 text-sm text-zinc-400">{subtitle}</div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-100"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          {typeof reset === "function" ? (
            <button
              type="button"
              className="rounded-md bg-zinc-800/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
              onClick={() => reset()}
            >
              Try again
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-md bg-zinc-800/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
            onClick={onCopy}
          >
            {copied ? "Copied" : "Copy debug info"}
          </button>
        </div>

        <pre className="mt-4 max-h-[40vh] overflow-auto rounded-xl border border-zinc-800 bg-black/30 p-4 text-xs text-zinc-200 whitespace-pre-wrap">
          {details}
        </pre>
      </div>
    </div>
  );
}
