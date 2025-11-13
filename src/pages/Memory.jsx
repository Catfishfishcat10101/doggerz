// src/pages/Memory.jsx
export default function Memory() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
        Memories
      </h1>

      <p className="text-zinc-400 mb-8">
        Dog memories, milestones, level-ups, evolutions, and special events will
        live here. Think of this as your virtual scrapbook.
      </p>

      <div className="border border-zinc-800 rounded-xl p-6 text-zinc-300">
        No memories yet — play with your pup and build your story.
      </div>
    </div>
  );
}
