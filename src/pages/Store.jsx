// src/pages/Store.jsx
// Store: buy + preview cosmetics (collars/tags/backdrops).

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useToast } from "@/components/ToastProvider.jsx";

import SpriteSheetDog from "@/features/game/components/SpriteSheetDog.jsx";
import DogCosmeticsOverlay from "@/features/game/components/DogCosmeticsOverlay.jsx";
import { getSpriteForStageAndTier } from "@/utils/lifecycle.js";

import {
  purchaseCosmetic,
  selectCosmeticCatalog,
  selectDog,
  equipCosmetic,
  selectNextStreakReward,
} from "@/redux/dogSlice.js";
import { selectUserCoins } from "@/redux/userSlice.js";

const EMPTY_EQUIPPED = Object.freeze({ collar: null, tag: null, backdrop: null });

function priceForCatalogItem(item) {
  const threshold = Math.max(0, Math.round(Number(item?.threshold) || 0));
  // Keep it simple: make store prices scale with streak thresholds.
  return Math.max(25, threshold * 25);
}

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function titleCase(s) {
  return String(s || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cosmeticDescription(item) {
  const slot = String(item?.slot || "").toLowerCase();
  const id = String(item?.id || "");
  if (slot === "collar") {
    if (id === "collar_leaf") return "A fresh, leafy collar with a soft emerald glow.";
    if (id === "collar_neon") return "A bright neon collar for maximum main-character energy.";
    return "A stylish collar for your pup.";
  }
  if (slot === "tag") {
    if (id === "tag_star") return "A shiny star tag that catches the light.";
    return "A cute tag that shows off your pup.";
  }
  if (slot === "backdrop") {
    if (id === "backdrop_sunset") return "Warm sunset vibes behind your yard.";
    return "A backdrop to change the mood of the yard.";
  }
  return "A cosmetic item.";
}

function rarityForThreshold(threshold) {
  const t = Math.max(0, Math.round(Number(threshold) || 0));
  if (t >= 21)
    return {
      id: "legendary",
      label: "Legendary",
      className: "border-fuchsia-400/25 bg-fuchsia-500/15 text-fuchsia-100",
    };
  if (t >= 14)
    return {
      id: "epic",
      label: "Epic",
      className: "border-violet-400/25 bg-violet-500/15 text-violet-100",
    };
  if (t >= 7)
    return {
      id: "rare",
      label: "Rare",
      className: "border-sky-400/25 bg-sky-500/15 text-sky-100",
    };
  if (t >= 3)
    return {
      id: "uncommon",
      label: "Uncommon",
      className: "border-emerald-400/25 bg-emerald-500/15 text-emerald-100",
    };
  return {
    id: "common",
    label: "Common",
    className: "border-white/15 bg-white/5 text-zinc-200",
  };
}

function ProgressBar({ value = 0, className = "" }) {
  const pct = Math.round(clamp(value, 0, 1) * 100);
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30 ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SlotPill({ slot }) {
  const s = String(slot || "cosmetic").toLowerCase();
  const label = s ? titleCase(s) : "Cosmetic";
  const color =
    s === "collar"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      : s === "tag"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-100"
        : s === "backdrop"
          ? "border-sky-500/25 bg-sky-500/10 text-sky-100"
          : "border-white/15 bg-white/5 text-zinc-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${color}`}
    >
      {label}
    </span>
  );
}

export default function Store() {
  const dispatch = useDispatch();
  const toast = useToast();

  const dog = useSelector(selectDog);
  const userCoins = useSelector(selectUserCoins);
  const catalog = useSelector(selectCosmeticCatalog);
  const nextRewardInfo = useSelector(selectNextStreakReward);

  const coins = Number.isFinite(Number(dog?.coins))
    ? Math.max(0, Math.round(Number(dog.coins)))
    : Math.max(0, Math.round(Number(userCoins) || 0));

  const unlocked = useMemo(
    () =>
      new Set(
        Array.isArray(dog?.cosmetics?.unlockedIds)
          ? dog.cosmetics.unlockedIds
          : []
      ),
    [dog?.cosmetics?.unlockedIds]
  );

  const equipped = dog?.cosmetics?.equipped ?? EMPTY_EQUIPPED;

  const [slotFilter, setSlotFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [ownedFilter, setOwnedFilter] = useState("all"); // all | owned | unowned
  const [affordFilter, setAffordFilter] = useState("all"); // all | affordable
  const [sortKey, setSortKey] = useState("recommended"); // recommended | price | threshold

  // Preview / try-on state
  const [preview, setPreview] = useState(null); // { slot, id }
  const [focusedId, setFocusedId] = useState(null);

  // Dev-only: helps diagnose "dog not rendering" by exposing sprite loading state.
  const [spriteDebug, setSpriteDebug] = useState(null);

  const stageId = String(dog?.lifeStage?.stage || "PUPPY").toUpperCase();
  const fallbackSprite = useMemo(
    () => getSpriteForStageAndTier(stageId, dog?.cleanlinessTier),
    [dog?.cleanlinessTier, stageId],
  );

  const previewEquipped = useMemo(() => {
    if (!preview?.slot || !preview?.id) return equipped;
    return {
      collar: equipped?.collar || null,
      tag: equipped?.tag || null,
      backdrop: equipped?.backdrop || null,
      [preview.slot]: preview.id,
    };
  }, [equipped, preview?.id, preview?.slot]);

  const selectedBackdrop = previewEquipped?.backdrop || equipped?.backdrop;

  const backdropStyle = useMemo(() => {
    if (selectedBackdrop === "backdrop_sunset") {
      return {
        background:
          "radial-gradient(1000px 400px at 50% 25%, rgba(251,191,36,0.25), transparent 55%), radial-gradient(900px 380px at 30% 15%, rgba(244,63,94,0.18), transparent 60%), radial-gradient(900px 380px at 70% 15%, rgba(59,130,246,0.14), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55))",
      };
    }
    return {
      background:
        "radial-gradient(900px 380px at 50% 25%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(800px 360px at 30% 12%, rgba(56,189,248,0.10), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.60))",
    };
  }, [selectedBackdrop]);

  const catalogItems = useMemo(() => {
    const items = Array.isArray(catalog) ? catalog : [];
    const q = String(query || "").trim().toLowerCase();

    const filtered = items
      .filter((it) => it && typeof it === "object")
      .filter((it) => {
        const id = String(it.id || "").trim();
        if (!id) return false;

        const slot = String(it.slot || "").toLowerCase();
        if (slotFilter !== "all" && slot !== slotFilter) return false;

        const owned = unlocked.has(id);
        if (ownedFilter === "owned" && !owned) return false;
        if (ownedFilter === "unowned" && owned) return false;

        const price = priceForCatalogItem(it);
        const afford = coins >= price;
        if (affordFilter === "affordable" && !afford) return false;

        if (q) {
          const label = String(it.label || id).toLowerCase();
          const slotText = String(it.slot || "").toLowerCase();
          if (!label.includes(q) && !id.toLowerCase().includes(q) && !slotText.includes(q)) return false;
        }

        return true;
      });

    const sorted = [...filtered];
    if (sortKey === "price") {
      sorted.sort((a, b) => priceForCatalogItem(a) - priceForCatalogItem(b));
    } else if (sortKey === "threshold") {
      sorted.sort((a, b) => (Number(a.threshold) || 0) - (Number(b.threshold) || 0));
    } else {
      // recommended: slot grouping + threshold
      const slotRank = (s) => (s === "collar" ? 0 : s === "tag" ? 1 : s === "backdrop" ? 2 : 9);
      sorted.sort((a, b) => {
        const sa = String(a.slot || "").toLowerCase();
        const sb = String(b.slot || "").toLowerCase();
        const ra = slotRank(sa);
        const rb = slotRank(sb);
        if (ra !== rb) return ra - rb;
        return (Number(a.threshold) || 0) - (Number(b.threshold) || 0);
      });
    }

    return sorted;
  }, [affordFilter, catalog, coins, ownedFilter, query, slotFilter, sortKey, unlocked]);

  const focusedItem = useMemo(() => {
    const id = String(focusedId || preview?.id || "").trim();
    if (!id) return null;
    return (
      (Array.isArray(catalog) ? catalog : []).find(
        (it) => String(it?.id || "").trim() === id
      ) || null
    );
  }, [catalog, focusedId, preview?.id]);

  const streakDays = Math.max(0, Math.floor(Number(nextRewardInfo?.streakDays) || 0));
  const nextReward = nextRewardInfo?.next || null;

  const featuredDeal = useMemo(() => {
    const items = Array.isArray(catalog) ? catalog : [];
    const unownedAffordable = items
      .filter((it) => it && typeof it === "object")
      .filter((it) => {
        const id = String(it?.id || "").trim();
        if (!id) return false;
        if (unlocked.has(id)) return false;
        const price = priceForCatalogItem(it);
        return coins >= price;
      })
      .sort((a, b) => priceForCatalogItem(a) - priceForCatalogItem(b));

    return unownedAffordable[0] || null;
  }, [catalog, coins, unlocked]);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Store
            </div>
            <div className="truncate text-lg font-extrabold text-emerald-200">
              Spend coins on goodies
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold">
              <span className="text-emerald-200">Coins</span>
              <span className="tabular-nums">{coins}</span>
            </span>
            <Link
              to="/game"
              className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Back to Yard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* Hero */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-black/25 p-6 overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Doggerz Store</div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200">
                Dress your pup. Flex your streak.
              </div>
              <div className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-2xl">
                Try cosmetics before buying, unlock freebies by keeping your streak alive, and swap your look instantly.
                (No buyer’s remorse—your pup can’t judge you. Probably.)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100">
                <span className="text-emerald-200">Try-on</span>
                <span className="text-zinc-300">Preview anything</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100">
                <span className="text-emerald-200">Streak</span>
                <span className="text-zinc-300">Free unlocks</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100">
                <span className="text-emerald-200">Badges</span>
                <span className="text-zinc-300">Show off in-game</span>
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">How to earn coins</div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">Care = currency</div>
              <div className="mt-2 text-sm text-zinc-300">
                Feed, play, train, and keep routines consistent. The Store is optional—streak rewards are the chill path.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Try-on tips</div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">Hover to preview</div>
              <div className="mt-2 text-sm text-zinc-300">
                Hover items to preview instantly. Click an item for details. Buy + auto-equip (you can change it anytime).
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Coming soon</div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">More cosmetics</div>
              <div className="mt-2 text-sm text-zinc-300">
                New collars, tags, and animated rewards are on the way. Your streak will matter.
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT: Preview + wallet */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-20 space-y-4">
              <section className="rounded-3xl border border-white/10 bg-black/25 overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Preview</div>
                      <div className="mt-1 text-lg font-extrabold text-zinc-100">Your pup, dressed up</div>
                    </div>
                    {preview?.id ? (
                      <button
                        type="button"
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                        onClick={() => setPreview(null)}
                      >
                        Clear try-on
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 overflow-hidden">
                    <div className="relative h-[360px] sm:h-[420px]">
                      <div className="absolute inset-0" style={backdropStyle} />
                      <div className="absolute inset-0 bg-black/25" />

                      <div className="absolute inset-0 grid place-items-center">
                        <div className="relative" style={{ width: 360, height: 360 }}>
                          <SpriteSheetDog
                            stage={stageId}
                            anim={"idle"}
                            facing={1}
                            size={360}
                            reduceMotion={false}
                            fallbackSrc={fallbackSprite}
                            className="select-none"
                            onDebug={import.meta.env.DEV ? setSpriteDebug : undefined}
                          />
                          <div className="pointer-events-none absolute inset-0">
                            <DogCosmeticsOverlay
                              equipped={previewEquipped}
                              size={360}
                              facing={1}
                              reduceMotion={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                        <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="text-zinc-200">
                              Equipped:
                              <span className="ml-2 text-emerald-200 font-semibold">Collar</span>
                              <span className="ml-1 text-zinc-100">{equipped?.collar ? titleCase(String(equipped.collar).replace(/^collar_/, "")) : "None"}</span>
                              <span className="mx-2 text-zinc-600">•</span>
                              <span className="text-emerald-200 font-semibold">Tag</span>
                              <span className="ml-1 text-zinc-100">{equipped?.tag ? titleCase(String(equipped.tag).replace(/^tag_/, "")) : "None"}</span>
                            </div>
                            <div className="text-zinc-300">
                              Unlocked: <span className="font-semibold text-zinc-100">{unlocked.size}</span>
                            </div>
                          </div>

                          {import.meta.env.DEV ? (
                            <div className="mt-2 text-[11px] text-zinc-400">
                              Sprite: <span className="font-semibold text-zinc-200">{spriteDebug?.sheetLoaded ? 'anim strip' : 'fallback'}</span>
                              {spriteDebug?.sheetFailed ? (
                                <span className="text-amber-200"> · strip failed</span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-zinc-300 leading-relaxed">
                    Buy cosmetics with coins, or unlock them free from streak rewards. Try-on previews don’t change your save until you equip.
                  </div>

                  {focusedItem ? (() => {
                    const id = String(focusedItem?.id || "").trim();
                    if (!id) return null;
                    const slot = String(focusedItem?.slot || "cosmetic").toLowerCase();
                    const label = String(focusedItem?.label || id);
                    const threshold = clamp(Number(focusedItem?.threshold || 0), 0, 9999);
                    const price = priceForCatalogItem(focusedItem);
                    const owned = unlocked.has(id);
                    const afford = coins >= price;
                    const isEquipped = slot && equipped?.[slot] === id;
                    const rarity = rarityForThreshold(threshold);

                    const progress = threshold > 0 ? clamp(streakDays / threshold, 0, 1) : 1;
                    const daysLeft = Math.max(0, Math.ceil(threshold - streakDays));

                    return (
                      <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <SlotPill slot={slot} />
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rarity.className}`}
                              >
                                {rarity.label}
                              </span>
                            </div>
                            <div className="mt-2 truncate text-base font-extrabold text-zinc-100">{label}</div>
                            <div className="mt-1 text-xs text-zinc-400">{cosmeticDescription(focusedItem)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-zinc-400">Price</div>
                            <div className="mt-1 text-sm font-extrabold tabular-nums text-emerald-200">{price}</div>
                            <div className="mt-2 text-[11px] text-zinc-500">Free at day {threshold}</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Streak progress</span>
                            <span className="tabular-nums text-zinc-200">
                              {Math.min(streakDays, threshold)}/{threshold || 0}
                              {threshold ? (
                                <span className="text-zinc-500">
                                  {" "}· {daysLeft === 0 ? "Eligible" : `${daysLeft}d left`}
                                </span>
                              ) : null}
                            </span>
                          </div>
                          <div className="mt-2">
                            <ProgressBar value={progress} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className="rounded-2xl px-4 py-3 text-xs font-bold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                            onClick={() => setPreview({ slot, id })}
                          >
                            Try on
                          </button>

                          {owned ? (
                            <button
                              type="button"
                              className={`rounded-2xl px-4 py-3 text-xs font-bold transition ${isEquipped
                                ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                                : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                                }`}
                              onClick={() => {
                                if (!slot) return;
                                dispatch(equipCosmetic({ slot, id }));
                                toast.success(isEquipped ? "Already equipped." : `Equipped ${label}.`, 1400);
                              }}
                            >
                              {isEquipped ? "Equipped" : "Equip"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!afford}
                              onClick={() => {
                                if (!afford) return;
                                dispatch(
                                  purchaseCosmetic({
                                    id,
                                    price,
                                    now: Date.now(),
                                  })
                                );

                                // QoL: auto-equip on purchase for wearable slots.
                                if (slot === "collar" || slot === "tag" || slot === "backdrop") {
                                  dispatch(equipCosmetic({ slot, id }));
                                }

                                toast.success(`Purchased ${label}.`, 1600);
                              }}
                              className={`rounded-2xl px-4 py-3 text-xs font-bold transition active:scale-[0.99] ${afford
                                ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/25 hover:bg-emerald-500/25"
                                : "bg-white/5 text-zinc-500 cursor-not-allowed"
                                }`}
                            >
                              {afford ? "Buy" : "Not enough"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })() : null}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Wallet</div>
                    <div className="mt-1 text-lg font-extrabold text-emerald-200 tabular-nums">{coins} coins</div>
                  </div>
                  <Link
                    to="/settings"
                    className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                  >
                    Manage cosmetics
                  </Link>
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  Tip: streak rewards unlock automatically; the Store is the fast lane.
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Progress</div>
                    <div className="mt-1 text-lg font-extrabold text-zinc-100">Streak rewards</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100">
                    <span className="text-emerald-200">Streak</span>
                    <span className="tabular-nums">{streakDays}d</span>
                  </span>
                </div>

                {nextReward ? (
                  <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-400">Next free unlock</div>
                        <div className="mt-1 truncate text-sm font-extrabold text-emerald-200">
                          {nextReward.label || nextReward.id}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">Day {nextReward.threshold}</div>
                      </div>
                      <SlotPill slot={nextReward.slot} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        value={
                          nextReward.threshold
                            ? clamp(streakDays / nextReward.threshold, 0, 1)
                            : 0
                        }
                      />
                      <div className="mt-2 text-[11px] text-zinc-500">
                        {Math.max(
                          0,
                          Math.ceil((Number(nextReward.threshold) || 0) - streakDays)
                        )}{" "}
                        day(s) left
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-zinc-400">You’ve unlocked every streak cosmetic. Nice.</div>
                )}

                {featuredDeal ? (
                  <div className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/90">Featured deal</div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-100">Affordable right now</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-zinc-100">
                          {featuredDeal.label || featuredDeal.id}
                        </div>
                        <div className="mt-1 text-xs text-emerald-100/80">
                          {priceForCatalogItem(featuredDeal)} coins
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-2xl px-4 py-2 text-xs font-extrabold bg-emerald-400 text-black hover:bg-emerald-300 transition"
                        onClick={() => {
                          const id = String(featuredDeal?.id || "").trim();
                          const slot = String(featuredDeal?.slot || "").toLowerCase();
                          if (!id) return;
                          setFocusedId(id);
                          setPreview({ slot, id });
                        }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-zinc-400">
                  Earn coins by feeding, playing, training, and keeping your pup’s routine consistent.
                </div>
              </section>
            </div>
          </aside>

          {/* RIGHT: Catalog */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Catalog</div>
                  <div className="mt-1 text-lg font-extrabold text-zinc-100">Dress your dog like they own the yard</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={slotFilter}
                    onChange={(e) => setSlotFilter(e.target.value)}
                  >
                    <option value="all">All slots</option>
                    <option value="collar">Collars</option>
                    <option value="tag">Tags</option>
                    <option value="backdrop">Backdrops</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={ownedFilter}
                    onChange={(e) => setOwnedFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="owned">Owned</option>
                    <option value="unowned">Unowned</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={affordFilter}
                    onChange={(e) => setAffordFilter(e.target.value)}
                  >
                    <option value="all">Any price</option>
                    <option value="affordable">Affordable</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="threshold">Sort: Streak day</option>
                    <option value="price">Sort: Price</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search collars, tags, backdrops…"
                  className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalogItems.map((item) => {
                  const id = String(item?.id || "").trim();
                  if (!id) return null;

                  const slot = String(item?.slot || "cosmetic").toLowerCase();
                  const label = String(item?.label || id);
                  const threshold = clamp(Number(item?.threshold || 0), 0, 9999);

                  const price = priceForCatalogItem(item);
                  const owned = unlocked.has(id);
                  const afford = coins >= price;
                  const isEquipped = slot && equipped?.[slot] === id;
                  const rarity = rarityForThreshold(threshold);
                  const streakProgress = threshold > 0 ? clamp(streakDays / threshold, 0, 1) : 0;

                  return (
                    <div
                      key={id}
                      className="rounded-3xl border border-white/10 bg-black/30 p-5 hover:bg-black/35 transition"
                      onMouseEnter={() => {
                        setPreview({ slot, id });
                        setFocusedId(id);
                      }}
                      onMouseLeave={() => setPreview((p) => (p?.id === id ? null : p))}
                      onClick={() => setFocusedId(id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SlotPill slot={slot} />
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rarity.className}`}
                            >
                              {rarity.label}
                            </span>
                          </div>
                          <div className="mt-2 truncate text-base font-extrabold text-zinc-100">{label}</div>
                          <div className="mt-1 text-xs text-zinc-400">{cosmeticDescription(item)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-zinc-400">Price</div>
                          <div className="mt-1 text-sm font-bold tabular-nums text-emerald-200">{price}</div>
                          <div className="mt-2 text-[11px] text-zinc-500">Streak day {threshold}</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Free unlock progress</span>
                          <span className="tabular-nums">{Math.min(streakDays, threshold)}/{threshold || 0}</span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={streakProgress} />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="rounded-2xl px-4 py-3 text-xs font-bold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                          onClick={() => setPreview({ slot, id })}
                        >
                          Try on
                        </button>

                        {owned ? (
                          <button
                            type="button"
                            className={`rounded-2xl px-4 py-3 text-xs font-bold transition ${isEquipped
                              ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                              : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                              }`}
                            onClick={() => {
                              if (!slot) return;
                              dispatch(equipCosmetic({ slot, id }));
                              toast.success(isEquipped ? "Already equipped." : `Equipped ${label}.`, 1400);
                            }}
                          >
                            {isEquipped ? "Equipped" : "Equip"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!afford}
                            onClick={() => {
                              if (!afford) return;
                              dispatch(
                                purchaseCosmetic({
                                  id,
                                  price,
                                  now: Date.now(),
                                })
                              );

                              // QoL: auto-equip on purchase for wearable slots.
                              if (slot === "collar" || slot === "tag" || slot === "backdrop") {
                                dispatch(equipCosmetic({ slot, id }));
                              }

                              toast.success(`Purchased ${label}.`, 1600);
                            }}
                            className={`rounded-2xl px-4 py-3 text-xs font-bold transition active:scale-[0.99] ${afford
                              ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/25 hover:bg-emerald-500/25"
                              : "bg-white/5 text-zinc-500 cursor-not-allowed"
                              }`}
                          >
                            {afford ? "Buy" : "Not enough"}
                          </button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{owned ? "Owned" : "Not owned"}</span>
                        <span className="tabular-nums">Balance after: {owned ? coins : Math.max(0, coins - price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {catalogItems.length === 0 ? (
                <div className="mt-6 text-sm text-zinc-400">
                  No matches. Try clearing filters.
                </div>
              ) : null}

              {(!catalog || catalog.length === 0) && (
                <div className="mt-6 text-sm text-zinc-400">No items yet — coming soon.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
