export default function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[0.68em] font-black uppercase tracking-[0.23em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-100">{value}</p>
    </div>
  );
}
