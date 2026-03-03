/** @format */
// src/components/PuppyPassport.jsx

import * as React from "react";
import { useSelector } from "react-redux";

import { selectDog } from "@/redux/dogSlice.js";

function getTrainingRank(bond) {
  const value = Number(bond || 0);
  if (value > 90) return "Grand Master";
  if (value > 70) return "Agility Pro";
  if (value > 40) return "Good Boy";
  return "Newborn";
}

function formatDate(value) {
  if (!Number.isFinite(value) || value <= 0) return "Unknown";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

function resolveBirthDate(dog, birthDate) {
  const candidate =
    Number(birthDate) ||
    Number(dog?.adoptedAt) ||
    Number(dog?.temperament?.adoptedAt) ||
    Number(dog?.memory?.firstSeenAt) ||
    Number(dog?.memory?.lastSeenAt) ||
    Number(dog?.lastUpdatedAt) ||
    Date.now();
  return Number.isFinite(candidate) ? candidate : Date.now();
}

function resolveBadgeId(dog) {
  const breed = String(dog?.breed || "jack_russell").toLowerCase();
  if (breed.includes("jack")) return "JRT-01";
  if (breed.includes("golden")) return "GRT-01";
  return "PUP-01";
}

export default function PuppyPassport({ dog: propDog, birthDate, className }) {
  const storeDog = useSelector(selectDog);
  const dog = propDog || storeDog || {};
  const stats = dog?.stats || {};
  const bondValue = Number(dog?.bond?.value ?? 0);

  const rank = React.useMemo(() => getTrainingRank(bondValue), [bondValue]);
  const status = Number(stats.energy ?? 0) > 20 ? "Active" : "Napping";
  const dobValue = resolveBirthDate(dog, birthDate);
  const dobLabel = formatDate(dobValue);

  return (
    <div
      className={[
        "w-64 rounded-2xl border-2 border-amber-200 bg-amber-50/95 p-4 text-zinc-800 shadow-xl",
        "rotate-1 font-serif",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-3 flex items-center justify-between border-b border-amber-200 pb-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.35em]">
          Pup Passport
        </h2>
        <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
          {resolveBadgeId(dog)}
        </span>
      </div>

      <div className="space-y-1 text-[11px]">
        <p>
          <span className="mr-1 text-[9px] font-bold uppercase text-zinc-500">
            Name:
          </span>
          {dog?.name || "Jack Russell"}
        </p>
        <p>
          <span className="mr-1 text-[9px] font-bold uppercase text-zinc-500">
            DOB:
          </span>
          {dobLabel}
        </p>
        <p>
          <span className="mr-1 text-[9px] font-bold uppercase text-zinc-500">
            Status:
          </span>
          {status}
        </p>
        <p>
          <span className="mr-1 text-[9px] font-bold uppercase text-zinc-500">
            Rank:
          </span>
          {rank}
        </p>
      </div>

      <div className="mt-4 border-t border-dashed border-amber-300 pt-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-400 text-center text-[8px] text-zinc-600">
          OFFICIAL PIXEL
          <br />
          PUP SEAL
        </div>
      </div>
    </div>
  );
}
