import React from 'react';
import { useSelector } from 'react-redux';
import { selectDog } from '@/redux/dogSlice.js';
import { resetDogState } from '@/redux/dogSlice.js';
import { saveMemorialToCloud } from '@/redux/dogThunks.js';
import { useAppDispatch } from '@/redux/hooks.js';

export default function RainbowBridge() {
  const dog = useSelector(selectDog) || {};
  const dispatch = useAppDispatch();
  const deceasedAt = dog.deceasedAt;
  if (!deceasedAt) return null;
  const recent = (dog.journal?.entries || []).slice(0, 8);

  function keepMemoryAndAdopt() {
    const memorial = { name: dog.name, deceasedAt: dog.deceasedAt, journal: recent };
    // try cloud first
    try {
      // Dispatch thunk via `useAppDispatch` (already typed as `any` internally)
      const p = dispatch(saveMemorialToCloud(/** @type {any} */ (memorial)));
      if (p && typeof p.then === 'function') {
        p.then(() => dispatch(resetDogState())).catch(() => {
          // fallback to localStorage on error
          try {
            const memorials = JSON.parse(localStorage.getItem('doggerz:memorials') || '[]');
            memorials.unshift(memorial);
            localStorage.setItem('doggerz:memorials', JSON.stringify(memorials.slice(0, 20)));
          } catch (e) {}
          dispatch(resetDogState());
        });
        return;
      }
    } catch (e) {
      // fall through to localStorage fallback
    }

    try {
      const memorials = JSON.parse(localStorage.getItem('doggerz:memorials') || '[]');
      memorials.unshift(memorial);
      localStorage.setItem('doggerz:memorials', JSON.stringify(memorials.slice(0, 20)));
    } catch (e) {
      // ignore localStorage errors
    }
    dispatch(resetDogState());
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gradient-to-b from-rose-300 via-amber-300 to-indigo-400/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-4 p-6 rounded-2xl bg-white/95 shadow-2xl text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-rose-700">Crossed the Rainbow Bridge</h2>
            <p className="mt-2 text-slate-700">{dog.name} has peacefully crossed the Rainbow Bridge.</p>
            <p className="mt-1 text-sm text-slate-600">{new Date(deceasedAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => dispatch(resetDogState())}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md shadow hover:bg-emerald-500 ml-2"
            >
              Adopt New Pup
            </button>
            <button
              onClick={keepMemoryAndAdopt}
              className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-500"
            >
              Keep Memory & Adopt New Pup
            </button>
          </div>
        </div>

        {recent.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700">Recent journal</h3>
            <ul className="mt-2 max-h-44 overflow-auto space-y-2">
              {recent.map((e) => (
                <li key={e.id} className="p-2 rounded-md bg-zinc-100/60">
                  <div className="text-[0.85rem] font-semibold">{e.summary}</div>
                  <div className="text-[0.75rem] text-slate-600">{new Date(e.timestamp).toLocaleString()}</div>
                  <div className="text-[0.8rem] text-slate-700 mt-1">{e.body}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Note: `saveMemorialToCloud` thunk is implemented in `src/redux/dogThunks.js`.
// This file should not redeclare it — keep the component focused on UI.
