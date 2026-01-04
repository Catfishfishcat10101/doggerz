// src/components/memorial/RainbowBridgeMemorial.jsx
// Beautiful, peaceful Rainbow Bridge memorial experience with final letter

import * as React from 'react';

/**
 * RainbowBridgeMemorial - A peaceful memorial experience for natural senior passings
 * 
 * @param {Object} props
 * @param {string} props.dogName - The dog's name
 * @param {number} props.bondValue - Bond percentage (0-100)
 * @param {Array} props.memories - Array of memory entries
 * @param {Function} props.onComplete - Completion callback
 */
export default function RainbowBridgeMemorial({ dogName = 'Beloved Pup', bondValue = 100, memories = [], onComplete }) {
  const [step, setStep] = React.useState(0); // 0: transition, 1: memories, 2: final letter, 3: candle
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const highlightMemories = React.useMemo(() => {
    // Pick 3-5 special moments
    return memories.slice(0, 5);
  }, [memories]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }
  };

  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-1000
        ${isVisible 
          ? 'opacity-100 bg-gradient-to-b from-indigo-950/95 via-purple-950/95 to-pink-950/95' 
          : 'opacity-0 bg-black/0'
        }
      `}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl w-full">
        {/* Step 0: Rainbow transition */}
        {step === 0 && (
          <div 
            className={`
              text-center space-y-8 transition-all duration-1000
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            {/* Rainbow bridge arc */}
            <div className="relative h-64 flex items-end justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md h-32 rounded-t-full border-8 border-transparent bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 opacity-40 blur-sm animate-pulse" 
                     style={{ animationDuration: '4s' }} 
                />
              </div>
              <div className="relative z-10 text-8xl animate-bounce" style={{ animationDuration: '3s' }}>
                🐾
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200">
                Crossing the Rainbow Bridge
              </h2>
              <p className="text-lg text-purple-100/80 max-w-lg mx-auto leading-relaxed">
                {dogName} lived a full, beautiful life. Now they rest in peace, surrounded by love and warmth.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="mt-8 px-8 py-3 rounded-2xl border border-purple-300/30 bg-purple-500/20 text-purple-100 font-semibold hover:bg-purple-500/30 transition-all duration-300"
            >
              Remember Together →
            </button>
          </div>
        )}

        {/* Step 1: Memory gallery */}
        {step === 1 && (
          <div className="space-y-6 animate-[fadeIn_0.8s_ease-out]">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-purple-100">
                Cherished Memories
              </h3>
              <p className="text-sm text-purple-200/70">
                The moments that made your journey together special
              </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {highlightMemories.length > 0 ? (
                highlightMemories.map((memory, i) => (
                  <div 
                    key={memory.id || i}
                    className="rounded-2xl border border-purple-300/20 bg-purple-900/20 backdrop-blur-sm p-4 animate-[slideInUp_0.5s_ease-out]"
                    style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards' }}
                  >
                    <p className="text-sm text-purple-100/90 leading-relaxed">
                      ✨ {memory.summary || memory.body}
                    </p>
                    {memory.timestamp && (
                      <p className="mt-2 text-xs text-purple-300/50">
                        {new Date(memory.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-purple-200/60 py-8">
                  Every moment together was precious, even if unwritten.
                </p>
              )}
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-2xl border border-purple-300/30 bg-purple-500/20 text-purple-100 font-semibold hover:bg-purple-500/30 transition-all duration-300"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Final letter from dog */}
        {step === 2 && (
          <div className="animate-[fadeIn_0.8s_ease-out]">
            <div 
              className="rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-amber-50/95 p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-6">
                <div className="font-serif text-2xl text-amber-950 italic">
                  My Dearest Hooman,
                </div>

                <div className="font-serif text-base text-amber-900/90 leading-relaxed space-y-4">
                  <p>
                    If you&apos;re reading this, it means my time in the yard has come to an end. But please, don&apos;t be too sad. I lived such a wonderful life because of you.
                  </p>
                  <p>
                    Every belly rub, every treat, every game of fetch—they all filled my heart with so much joy. You were the best hooman a pup could ever ask for.
                  </p>
                  <p>
                    I&apos;m resting now in a beautiful place where the sun is always warm, the grass is always soft, and there are endless treats. And you know what? I&apos;m waiting for you here, tail wagging, ready for the biggest reunion ever.
                  </p>
                  <p>
                    Until we meet again, I want you to remember: I loved you with every fiber of my being. Thank you for choosing me. Thank you for loving me. Thank you for everything.
                  </p>
                  <p className="font-semibold">
                    You gave me the best life a dog could have. 💛
                  </p>
                </div>

                <div className="pt-6 text-right space-y-2 border-t border-amber-900/20">
                  <div className="font-serif text-sm italic text-amber-800/80">
                    Forever in your heart,
                  </div>
                  <div className="font-serif text-2xl font-bold text-amber-950">
                    {dogName} 🐾
                  </div>
                  <div className="text-xs text-amber-800/60">
                    Bond: {bondValue}% • A lifetime of love
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-2xl border border-purple-300/30 bg-purple-500/20 text-purple-100 font-semibold hover:bg-purple-500/30 transition-all duration-300"
              >
                Light a Candle →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Memorial candle */}
        {step === 3 && (
          <div 
            className="text-center space-y-8 animate-[fadeIn_0.8s_ease-out]"
          >
            {/* Animated candle */}
            <div className="relative inline-block">
              <div className="text-8xl animate-pulse" style={{ animationDuration: '2s' }}>
                🕯️
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-orange-400/20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200">
                In Loving Memory
              </h3>
              <p className="text-lg text-purple-100/90 font-serif italic max-w-md mx-auto">
                &quot;Until one has loved an animal, a part of one&apos;s soul remains unawakened.&quot;
              </p>
              <p className="text-sm text-purple-200/60">
                {dogName} • Forever Loved • Always Remembered
              </p>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/20 text-emerald-100 font-bold hover:bg-emerald-500/30 transition-all duration-300 shadow-[0_6px_20px_rgba(16,185,129,0.2)]"
              >
                ✓ Complete Memorial
              </button>
              <p className="text-xs text-purple-200/50">
                You can always revisit this space to remember your friend
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
