import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Doggerz</h1>
        <p className="text-zinc-400 mb-6">Landing screen.</p>
        <div className="flex gap-3 justify-center">
          <Link className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500" to="/login">Login</Link>
          <Link className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700" to="/signup">Signup</Link>
          <Link className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700" to="/game">Play</Link>
        </div>
      </div>
    </main>
  );
}
