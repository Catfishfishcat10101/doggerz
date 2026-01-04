// src/components/CrashFallback.jsx

import * as React from 'react';
import { Link } from 'react-router-dom';
import { getDebugInfo, copyDebugInfoToClipboard } from '@/utils/debugInfo.js';
import { useToast } from '@/components/ToastProvider.jsx';

export default function CrashFallback({ title = 'Something went wrong', subtitle, error }) {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    // One clear fix: refresh.
    toast.once('crash:fallback', {
      type: 'error',
      message: 'Doggerz ran into an error. Try refreshing to recover.',
      durationMs: 6000,
      action: {
        label: 'Refresh',
        onClick: () => window.location.reload(),
      },
    });
  }, [toast]);

  const onCopy = async () => {
    try {
      const info = getDebugInfo({
        extra: {
          location: typeof window !== 'undefined' ? window.location.pathname : null,
          message: error?.message || String(error || ''),
        },
      });
      await copyDebugInfoToClipboard(info);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center bg-zinc-950 text-zinc-100 px-6">
      <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="text-xl font-semibold">{title}</div>
        {subtitle && <div className="mt-2 text-sm text-zinc-400">{subtitle}</div>}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-emerald-500/20 border border-emerald-500/35 px-3 py-2 text-sm text-emerald-100"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          <Link
            to="/"
            className="rounded-md bg-zinc-900/60 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-900/80"
          >
            Go home
          </Link>
          <button
            type="button"
            className="rounded-md bg-zinc-900/60 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-900/80"
            onClick={onCopy}
          >
            {copied ? 'Copied' : 'Copy debug info'}
          </button>
        </div>

        {import.meta.env.DEV && error && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-200">
            {String(error?.stack || error?.message || error)}
          </pre>
        )}
      </div>
    </div>
  );
}
