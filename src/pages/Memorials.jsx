// src/pages/Memorials.jsx
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";
import { useNavigate } from "react-router-dom";
import MemorialCard from "@/components/MemorialCard.jsx";
import {
  fetchMemorials,
  saveMemorial,
  deleteMemorial,
} from "@/redux/memorialsSlice.js";
import { selectDog, adoptFromMemorial } from "@/redux/dogSlice.js";

export default function Memorials() {
  const dispatch = useAppDispatch();
  const dog = useSelector(selectDog);
  const memorials = useSelector((s) => s.memorials?.items || []);
  const loading = useSelector((s) => s.memorials?.loading);
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMemorials());
  }, [dispatch]);

  function handleSaveCurrent() {
    if (!dog) return;
    const memorial = {
      name: dog.name,
      summary: `Remembering ${dog.name}.`,
      journal: dog.journal?.entries?.slice(0, 12) || [],
      statsSnapshot: { ...dog.stats, health: dog.health },
    };
    dispatch(saveMemorial(memorial));
  }

  function handleAdopt(memorial) {
    // dispatch adoptFromMemorial to set dog state based on memorial
    dispatch(adoptFromMemorial(memorial));
    // navigate to game screen
    navigate("/game");
  }

  function confirmDelete(id) {
    setPendingDelete(id);
  }

  function doDelete() {
    if (!pendingDelete) return;
    dispatch(deleteMemorial(pendingDelete));
    setPendingDelete(null);
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Memorials</h1>
          <p className="text-sm text-zinc-300">
            Saved memories of past pups and notable moments.
          </p>
        </header>

        <div className="flex gap-3">
          <button className="btn" onClick={handleSaveCurrent} disabled={!dog}>
            Save current pup as memorial
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && <div className="text-sm text-zinc-400">Loading…</div>}
          {!loading && memorials.length === 0 && (
            <div className="text-sm text-zinc-400">No memorials yet.</div>
          )}
          {memorials.map((m) => (
            <MemorialCard
              key={m.id || m.savedAt}
              memorial={m}
              onDelete={(id) => confirmDelete(id)}
              onRestore={(mem) => handleAdopt(mem)}
            />
          ))}
        </section>
        {/* Confirmation modal for deletes */}
        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold">Delete memorial?</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Are you sure you want to delete this memorial? This cannot be
                undone.
              </p>
              <div className="mt-4 flex gap-3 justify-end">
                <button className="btn btn--ghost" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn btn--warn" onClick={doDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
