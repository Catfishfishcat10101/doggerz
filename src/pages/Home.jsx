import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-center text-white">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
        Welcome to <span className="text-emerald-400">Doggerz</span>
      </h1>
      <p className="text-lg mb-8 text-slate-300">Adopt. Train. Bond.</p>

      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-lg shadow-lg hover:shadow-violet-500/40 transition"
      >
        Start
      </button>

      <p className="mt-8 text-sm text-slate-500">
        All Rights Reserved Doggerz @ 2025
      </p>
    </div>
  );
}
