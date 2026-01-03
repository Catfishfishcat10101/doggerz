// src/pages/SpriteTest.jsx
import FrameAnimator from "@/components/FrameAnimator.jsx";

export default function SpriteTest() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold">Sprite Test</h1>
      <p className="text-white/70 mt-2">
        Verifying one action renders from <code>/public/sprites</code>.
      </p>

      <div className="mt-6 flex flex-wrap gap-6 items-start">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70 mb-3">puppy / idle</div>
          <FrameAnimator baseUrl="/sprites/jrt/puppy/idle" />
        </div>
      </div>
    </div>
  );
}
