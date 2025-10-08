export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-[#0b1220] to-black">
      <h1 className="text-4xl font-extrabold tracking-wide text-teal-400 drop-shadow-lg">
        Welcome to <span className="text-indigo-400">Doggerz</span>
      </h1>
      <p className="mt-3 text-lg text-gray-300">Adopt. Train. Bond. Vibe.</p>
      <a
        href="/game"
        className="mt-8 px-6 py-3 text-lg bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white transition-all duration-200"
      >
        Start Game
      </a>
    </main>
  );
}