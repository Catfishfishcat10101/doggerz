import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight select-none">
          Doggerz
        </h1>
        <p className="mt-4 text-stone-300">
          Adopt a pixel pup. Raise it right. Flex the vibes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20 transition"
          >
            Sign in
          </Link>
          <Link
            to="/adopt"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition text-black font-semibold"
          >
            Adopt
          </Link>
        </div>
      </div>
    </div>
  );
}