// src/pages/Splash.jsx
// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";

export default function Splash() {
  // hero intro animation: excited -> bark -> idle
  const [animation, setAnimation] = React.useState("excited");

  React.useEffect(() => {
    let t1 = setTimeout(() => setAnimation("bark"), 900);
    let t2 = setTimeout(() => setAnimation("idle"), 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-50">
      {/* ...your existing left side DOGGERZ text / copy... */}

      {/* In the preview card, make sure you render this: */}
      <aside className="flex-1">
        <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-500/15 backdrop-blur">
          {/* ...header, labels, etc... */}

          <div className="mt-6 flex items-center justify-center">
            <EnhancedDogSprite
              animation={animation}
              scale={1.8}
              showCleanlinessOverlay={false}
              reducedMotion={false}
            />
          </div>

          {/* ...rest of your preview text... */}
        </div>
      </aside>
    </main>
  );
}
