import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';

/**
 * TrainingSystem - Phase 8 Logic
 * Handles Potty Gate and Sequential Command Unlocks
 */
export default function TrainingSystem() {
  // Mocking selectors - these would hook into your dog/training slices
  const pottyMastery = useSelector((state) => state.dog?.pottyMastery || 0);
  const bondLevel = useSelector((state) => state.dog?.bond || 1);
  const commandStats = useSelector((state) => state.training?.commands || {
    sit: { mastery: 0, unlocked: true },
    lay_down: { mastery: 0, unlocked: false },
    paw: { mastery: 0, unlocked: false },
    beg: { mastery: 0, unlocked: false }
  });

  const isPottyTrained = pottyMastery >= 100;

  const commands = [
    { id: 'sit', label: 'Sit', animation: 'Sit', req: 'None' },
    { id: 'lay_down', label: 'Lay Down', animation: 'Lay_Down', req: 'Sit mastery > 50%' },
    { id: 'paw', label: 'Give Paw', animation: 'Paw', req: 'Bond Level 5' },
    { id: 'beg', label: 'Beg', animation: 'Beg', req: 'Paw mastery > 70%' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Potty Training Status Card */}
      <div className={`rounded-3xl p-5 border transition-all ${isPottyTrained ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            {isPottyTrained ? <CheckCircle2 className="text-emerald-400" /> : <AlertCircle className="text-amber-400" />}
            Potty Training
          </h3>
          <span className="font-mono text-sm">{pottyMastery}%</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${isPottyTrained ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${pottyMastery}%` }}
          />
        </div>
        {!isPottyTrained && (
          <p className="mt-3 text-xs text-amber-200/70 leading-relaxed italic">
            "Master the yard basics before moving on to tricks. Accidents are part of the process."
          </p>
        )}
      </div>

      {/* Formal Training Gate */}
      <div className="relative">
        {!isPottyTrained && (
          <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-black/40 rounded-[32px] flex flex-col items-center justify-center p-6 text-center border border-white/5">
            <Lock className="w-8 h-8 text-zinc-500 mb-2" />
            <h4 className="font-bold text-zinc-300">Training Locked</h4>
            <p className="text-xs text-zinc-500 mt-1">Finish housebreaking your pup to unlock commands.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-2 mb-1">Command Mastery</h3>
          {commands.map((cmd) => {
            const stats = commandStats[cmd.id];
            const isUnlocked = isPottyTrained && (
              (cmd.id === 'sit') ||
              (cmd.id === 'lay_down' && commandStats.sit.mastery > 50) ||
              (cmd.id === 'paw' && bondLevel >= 5) ||
              (cmd.id === 'beg' && commandStats.paw.mastery > 70)
            );

            return (
              <CommandRow
                key={cmd.id}
                command={cmd}
                unlocked={isUnlocked}
                mastery={stats?.mastery || 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CommandRow({ command, unlocked, mastery }) {
  return (
    <button
      disabled={!unlocked}
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${unlocked
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40'
          : 'bg-black/20 border-white/5 opacity-60 cursor-not-allowed'
        }`}
    >
      <div className="flex flex-col items-start">
        <span className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-zinc-500'}`}>
          {command.label}
        </span>
        {!unlocked && (
          <span className="text-[10px] text-zinc-600 font-medium">Req: {command.req}</span>
        )}
        {unlocked && (
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 w-3 rounded-full ${i < Math.floor(mastery / 20) ? 'bg-emerald-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {unlocked ? (
          <>
            {mastery >= 100 && <Trophy className="w-4 h-4 text-amber-400" />}
            <div className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase">
              Train
            </div>
          </>
        ) : (
          <Lock className="w-4 h-4 text-zinc-700" />
        )}
      </div>

      {/* Progress highlight on hover if unlocked */}
      {unlocked && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-emerald-500/30 transition-all group-hover:w-full w-0" />
      )}
    </button>
  );
}