import { Link } from "react-router-dom";
export default function Login() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-sm w-full rounded-2xl border border-zinc-800 p-6">
        <h1 className="text-2xl font-semibold mb-2">Login</h1>
        <p className="text-sm text-zinc-400 mb-6">Stub page — Firebase/Google sign-in coming next.</p>
        <div className="flex gap-3">
          <Link className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700" to="/signup">Go to Signup</Link>
          <Link className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500" to="/game">Enter Game</Link>
        </div>
      </div>
    </main>
  );
}
