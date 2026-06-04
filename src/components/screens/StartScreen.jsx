// src/components/screens/StartScreen.jsx

export default function StartScreen() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 text-center">
        <div>
          <h1 className="text-5xl font-black-shadow uppercase tracking-[0.40em] text-emerald-500/100">
            DOGGERZ
          </h1>

          <p className="mt-10 text-sm font-bold-shadow leading-8 text-gray-100">
            ADOPT. RAISE. BOND. <br></br>
            Your own Autonomous Canine AI Companion. <br></br>
            Built to Remember you, Learn from you, and Grow with you.

            <br></br>
          </p>
        </div>

        <div className="grid  gap-8">
          <a
            href="/adopt"
            className="rounded-2xl border border-emerald-700 bg-black px-2 py-2 text-sm font-black uppercase tracking-[0.05em] text-emerald-600"
          >
            Adopt a pup
          </a>

          <a
            href="/login"
            className="rounded-2xl border border-emerald-700 bg-black px-2 py-2 text-sm font-black uppercase tracking-[0.05em] text-emerald-600"
          >
            Login
          </a>
        </div>
        <div className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500/75">
          Already have an account?
        </div>
      </section>
    </main>
  );
}
