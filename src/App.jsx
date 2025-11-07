import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '@/layout/RootLayout.jsx';
import RequireAuth from '@/layout/RequireAuth.jsx';
import { GameScreen } from '@/features/game';

function Home() {
  return (
    <main className="min-h-screen grid place-items-center text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Doggerz</h1>
        <p className="opacity-80 mb-6">Landing screen.</p>
        <div className="flex gap-3 justify-center">
          <a className="px-4 py-2 rounded bg-blue-600 text-white" href="/login">Login</a>
          <a className="px-4 py-2 rounded bg-slate-700" href="/signup">Signup</a>
          <a className="px-4 py-2 rounded bg-slate-800 pointer-events-none opacity-50">Play</a>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div style={{padding:24}}>Loading…</div>}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route
            path="/game"
            element={
              <RequireAuth>
                <GameScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
