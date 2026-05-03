// src/components/brand/DoggerzLogo.jsx
export default function DoggerzLogo({ size = "large" }) {
  const isLarge = size === "large";

  return (
    <div className="text-center">
      <h1
        className={[
          "font-black tracking-tight",
          isLarge ? "text-6xl sm:text-7xl" : "text-4xl",
          "bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent",
        ].join(" ")}
      >
        D<span className="inline-block translate-y-[-0.05em]">🐾</span>GGERZ
      </h1>

      <p
        className={[
          "mt-4 font-black uppercase tracking-[0.28em] text-slate-100",
          isLarge ? "text-xl sm:text-2xl" : "text-sm",
        ].join(" ")}
      >
        Adopt. Train. Bond.
      </p>
    </div>
  );
}
