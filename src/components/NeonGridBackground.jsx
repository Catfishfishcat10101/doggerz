// src/components/NeonGridBackground.jsx

export default function NeonGridBackground({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Neon glows */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        {/* Soft green / cyan blobs */}
        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.25),_transparent_55%)]" />
        {/* Faint grid lines */}
        <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
