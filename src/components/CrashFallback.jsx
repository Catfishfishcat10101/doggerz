// src/components/CrashFallback.jsx
// @ts-nocheck

import * as React from "react";

function safeStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    try {
      return String(value);
    } catch {
      return "";
    }
  }
}

function buildDebugText(error) {
  const lines = [];
  lines.push("[Doggerz crash]");
  try {
    lines.push(`time: ${new Date().toISOString()}`);
  } catch {
    // ignore
  }
  try {
    lines.push(`url: ${window.location.href}`);
  } catch {
    // ignore
  }
  try {
    lines.push(`ua: ${navigator.userAgent}`);
  } catch {
    // ignore
  }
  lines.push("");

  if (error) {
    lines.push("error:");
    lines.push(String(error?.message || error));
    if (error?.stack) {
      lines.push("");
      lines.push("stack:");
      lines.push(String(error.stack));
    }
    lines.push("");
  }

  return lines.join("\n");
}

export default function CrashFallback({
  title = "Something went wrong",
  subtitle = "Try refreshing the page.",
  error,
}) {
  const [copied, setCopied] = React.useState(false);
  const debugText = React.useMemo(() => buildDebugText(error), [error]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/35 p-6 sm:p-8 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.35)]">
        <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">
          Crash
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-2xl px-4 py-2 text-sm font-semibold border border-emerald-400/35 bg-emerald-500/15 text-white hover:bg-emerald-500/20 transition"
            onClick={() => {
              try {
                window.location.reload();
              } catch {
                // ignore
              }
            }}
          >
            Refresh
          </button>

          <button
            type="button"
            className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-white hover:bg-black/35 transition"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(debugText);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                try {
                  window.prompt("Copy debug info:", debugText);
                } catch {
                  // ignore
                }
              }
            }}
          >
            {copied ? "Copied" : "Copy debug"}
          </button>
        </div>

        {error ? (
          <details className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-200">
              Technical details
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
              {error?.stack ? String(error.stack) : safeStringify(error)}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

