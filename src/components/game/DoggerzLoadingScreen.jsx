import React from "react";

export default function DoggerzLoadingScreen({
  eyebrow = "DOGGERZ",
  title = "Opening the backyard",
  subtitle = "Bringing your pup into the yard.",
  tip = "Loading should move quickly once your save is ready.",
  className = "",
}) {
  return (
    <div
      className={`relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#0f3140_0%,#123847_22%,#14352f_58%,#0b1a18_100%)] text-[#f6f2e8] ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[radial-gradient(circle_at_50%_10%,rgba(128,214,245,0.3),transparent_44%),radial-gradient(circle_at_15%_18%,rgba(48,124,150,0.26),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(31,88,104,0.22),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-[27%] h-[16%] bg-[linear-gradient(180deg,rgba(103,153,115,0.2),rgba(50,88,58,0.42))]" />
        <div className="absolute inset-x-[-8%] bottom-[21%] h-[22%] rounded-[100%] bg-[radial-gradient(circle_at_50%_35%,rgba(152,234,181,0.2),rgba(67,115,74,0.3)_42%,rgba(0,0,0,0)_72%)] blur-xl" />
        <div className="absolute left-1/2 top-[44%] h-44 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(177,242,214,0.42),rgba(96,198,172,0.16)_42%,rgba(0,0,0,0)_74%)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-[23%] h-[14%] opacity-45 bg-[repeating-linear-gradient(90deg,rgba(113,78,53,0.95)_0,rgba(113,78,53,0.95)_2.8%,rgba(142,101,68,0.95)_2.8%,rgba(142,101,68,0.95)_5.4%,transparent_5.4%,transparent_7.7%)]" />
        <div className="absolute inset-x-0 bottom-[31%] h-[0.55rem] bg-[rgba(119,83,57,0.86)]" />
        <div className="absolute inset-x-0 bottom-[21%] h-[0.65rem] bg-[rgba(101,71,49,0.9)]" />
        <div className="absolute inset-x-[-10%] bottom-[-10%] h-[34%] rounded-t-[100%] bg-[linear-gradient(180deg,#4f8f45_0%,#2f6a37_42%,#163122_100%)]" />
        <div className="absolute inset-x-[18%] bottom-[17%] h-5 rounded-[100%] bg-black/25 blur-md" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[22svh] pt-12 text-center">
        <img
          src="/assets/icons/icon-192.png"
          alt=""
          width="72"
          height="72"
          className="h-16 w-16 rounded-[18px] border border-white/15 bg-white/8 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
          decoding="async"
        />
        <div className="mt-5 text-[0.76rem] font-bold uppercase tracking-[0.42em] text-[#dff4df]">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-[0.04em] text-[#fff8ea] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium text-[#e6f0e7]/84 sm:text-base">
          {subtitle}
        </p>

        <div className="relative mt-8 h-40 w-full max-w-xl">
          <img
            src="/assets/sprites/jr/pup_idle.png"
            alt=""
            width="192"
            height="192"
            className="absolute bottom-0 left-1/2 w-32 -translate-x-1/2 object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.38)] sm:w-36"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/12">
          <div className="h-full w-[42%] rounded-full bg-[linear-gradient(90deg,#d0f2c5_0%,#7adfc6_55%,#6cc9ef_100%)] animate-pulse" />
        </div>
        <p className="mt-4 max-w-md text-xs font-medium text-[#dce7dd]/74 sm:text-sm">
          {tip}
        </p>
      </div>
    </div>
  );
}
