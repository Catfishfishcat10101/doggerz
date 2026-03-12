// src/pages/Store.jsx
// Store: buy + preview cosmetics (collars/tags/backdrops).
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/state/toastContext.js";
import BackPill from "@/components/layout/BackPill.jsx";
import SpriteSheetDog from "@/components/dog/SpriteSheetDog.jsx";
import DogCosmeticsOverlay from "@/components/dog/DogCosmeticsOverlay.jsx";
import Tooltip from "@/components/ui/Tooltip.jsx";
import { PageHeader } from "@/components/layout/PageSections.jsx";
import { useDogStoreView } from "@/hooks/useDogState.js";
import { getSpriteForStageAndTier } from "@/utils/lifecycle.js";
import { resolveBackdropLayers } from "@/utils/backgroundLayers.js";
import {
  purchaseCosmetic,
  equipCosmetic,
  setActiveToy,
} from "@/redux/dogSlice.js";
import { selectUserCoins, selectUserIsFounder } from "@/redux/userSlice.js";
import {
  selectSettings,
  setStoreHoverPreview,
  setStoreShowEquippedFirst,
  setStoreCompactCards,
  setStoreSortKey,
} from "@/redux/settingsSlice.js";

const EMPTY_EQUIPPED = Object.freeze({
  collar: null,
  tag: null,
  backdrop: null,
});

const WEARABLE_SLOTS = new Set(["collar", "tag", "backdrop"]);

const STORE_CATEGORY_META = Object.freeze({
  toys: {
    label: "Toys",
    impact: "Boosts Happiness and Bond; reduces boredom.",
  },
  apparel: {
    label: "Apparel",
    impact: "Mostly cosmetic; some gear can reduce weather stress.",
  },
  care: {
    label: "Care & Consumables",
    impact: "Restores health, dirtiness, and dental condition.",
  },
  yard: {
    label: "Yard Upgrades",
    impact: "Improves passive comfort and long-term routine stability.",
  },
});

const TREASURE_DISPLAY_META = Object.freeze({
  rusty_key: {
    id: "rusty_key",
    label: "Rusty Key",
    icon: "🔑",
    flavor: "Rare pull from a deep scent trail.",
  },
  old_bone: {
    id: "old_bone",
    label: "Fossilized Bone",
    icon: "🦴",
    flavor: "Classic terrier jackpot.",
  },
  tennis_ball: {
    id: "tennis_ball",
    label: "Muddy Tennis Ball",
    icon: "🎾",
    flavor: "Common, but still worth bragging about.",
  },
});

function getStoreCategory(item) {
  const explicit = String(item?.category || "")
    .trim()
    .toLowerCase();
  if (explicit && STORE_CATEGORY_META[explicit]) return explicit;
  const slot = String(item?.slot || "")
    .trim()
    .toLowerCase();
  if (slot === "toy") return "toys";
  if (slot === "collar" || slot === "tag" || slot === "backdrop")
    return "apparel";
  if (slot === "consumable") return "care";
  if (slot === "yard_upgrade") return "yard";
  return "apparel";
}

function getCurrencyForItem(item) {
  const raw = String(item?.currency || "coins")
    .trim()
    .toLowerCase();
  return raw === "gems" ? "gems" : "coins";
}

function priceForCatalogItem(item) {
  const explicit = Number(item?.price);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
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
  const category = getStoreCategory(item);
  const slot = String(item?.slot || "").toLowerCase();
  const id = String(item?.id || "");
  if (category === "toys") {
    if (id === "toy_tennis_ball_basic")
      return "Free starter toy. Lower impact; works best with sustained active play.";
    if (id === "toy_squeaky_catfish")
      return "River-chaos favorite. Strong mood boost with a little terrier frenzy.";
    if (id === "toy_squeaky_squirrel")
      return "Strong boredom relief. High prey-drive pups get bonus happiness.";
    if (id === "toy_tug_rope")
      return "Great for bond growth through shared interaction.";
    if (id === "toy_heavy_frisbee")
      return "High-intensity toy that burns energy quickly.";
    if (id === "toy_plush_squeaky_fox")
      return "Big happiness spike and boredom relief; triggers thrashing behavior.";
    if (id === "toy_rc_robot_mouse")
      return "Ultimate toy: major bond gains and passive boredom management.";
    return "Reusable toy for active play and mood boosts.";
  }
  if (category === "care") {
    if (id === "toy_indestructible_bone")
      return "Chewing urge suppression item; blocks destructive chewing for 3 real days.";
    if (id === "care_oatmeal_shampoo")
      return "Soothes skin and helps recover from dirty states.";
    if (id === "care_dental_chew")
      return "Supports dental health and slows tooth decay.";
    if (id === "care_premium_kibble_pack_small")
      return "IAP pack with 5 premium bowls.";
    if (id === "care_premium_kibble_pack_large")
      return "IAP pack with 15 premium bowls.";
    return "Single-use care item to improve core wellbeing.";
  }
  if (category === "yard") {
    if (id === "yard_digging_sandbox")
      return "Redirects digging and lowers destructive outlets.";
    if (id === "yard_fancy_doghouse")
      return "Long-term comfort boost for rest and stress recovery.";
    return "Permanent yard upgrade that improves passive routine.";
  }
  if (slot === "collar") {
    if (id === "collar_plain_red")
      return "Starter collar included free at adoption.";
    if (id === "collar_leaf")
      return "A fresh, leafy collar with a soft emerald glow.";
    if (id === "collar_neon")
      return "A bright neon collar for maximum main-character energy.";
    if (id === "collar_midnight")
      return "A dark steel collar with a cool blue edge glow.";
    if (id === "collar_sunflare")
      return "A hot orange collar that looks sharp against night scenes.";
    if (id === "beta_collar_2026")
      return "Exclusive founder reward with a crisp beta-blue glow.";
    return "A stylish collar for your pup.";
  }
  if (slot === "tag") {
    if (id === "tag_heart") return "A warm heart tag for the clingy good dog era.";
    if (id === "tag_bolt") return "A fast-looking bolt tag for chaos gremlins and sprinters.";
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
  const label =
    s === "yard_upgrade"
      ? "Yard"
      : s === "consumable"
        ? "Consumable"
        : s
          ? titleCase(s)
          : "Cosmetic";
  const color =
    s === "collar"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      : s === "tag"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-100"
        : s === "backdrop"
          ? "border-sky-500/25 bg-sky-500/10 text-sky-100"
          : s === "toy"
            ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-100"
            : s === "consumable"
              ? "border-rose-500/25 bg-rose-500/10 text-rose-100"
              : s === "yard_upgrade"
                ? "border-orange-500/25 bg-orange-500/10 text-orange-100"
                : "border-white/15 bg-white/5 text-zinc-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${color}`}
    >
      {label}
    </span>
  );
}

function CategoryPill({ category }) {
  const key = String(category || "apparel").toLowerCase();
  const label = STORE_CATEGORY_META[key]?.label || titleCase(key);
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200">
      {label}
    </span>
  );
}

function ToggleChip({ active, onClick, children, tooltip = "" }) {
  return (
    <Tooltip content={tooltip || String(children)} side="top">
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
          active
            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
            : "border-white/15 bg-black/25 text-zinc-200 hover:bg-black/35"
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default function Store() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { dog, catalog, nextRewardInfo } = useDogStoreView();
  const userCoins = useSelector(selectUserCoins);
  const isFounder = useSelector(selectUserIsFounder);
  const settings = useSelector(selectSettings);

  const coins = Number.isFinite(Number(dog?.coins))
    ? Math.max(0, Math.round(Number(dog.coins)))
    : Math.max(0, Math.round(Number(userCoins) || 0));
  const gems = Math.max(0, Math.round(Number(dog?.gems || 0)));

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
  const activeToyId = String(dog?.inventory?.activeToyId || "").trim();
  const foundTreasures = useMemo(() => {
    const raw =
      dog?.inventory?.foundTreasures &&
      typeof dog.inventory.foundTreasures === "object"
        ? dog.inventory.foundTreasures
        : {};
    return Object.values(TREASURE_DISPLAY_META).map((item) => ({
      ...item,
      count: Math.max(0, Math.floor(Number(raw[item.id] || 0))),
    }));
  }, [dog?.inventory?.foundTreasures]);
  const totalTreasuresFound = useMemo(
    () =>
      foundTreasures.reduce(
        (sum, item) => sum + Math.max(0, Number(item.count || 0)),
        0
      ),
    [foundTreasures]
  );

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [ownedFilter, setOwnedFilter] = useState("all"); // all | owned | unowned
  const [affordFilter, setAffordFilter] = useState("all"); // all | affordable
  const sortKey = settings?.storeSortKey || "recommended";

  // Preview / try-on state
  const [preview, setPreview] = useState(null); // { slot, id }
  const [focusedId, setFocusedId] = useState(null);
  const [previewLocked, setPreviewLocked] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState({});
  const purchaseFeedbackTimersRef = useRef({});
  const previewOnHover = settings?.storeHoverPreview !== false;
  const showEquippedFirst = settings?.storeShowEquippedFirst !== false;
  const compactCards = settings?.storeCompactCards === true;

  // Dev-only: helps diagnose "dog not rendering" by exposing sprite loading state.
  const [spriteDebug, setSpriteDebug] = useState(null);

  useEffect(() => {
    if (!preview?.id && previewLocked) {
      setPreviewLocked(false);
      return;
    }
    if (!previewOnHover && !previewLocked && preview?.id) {
      setPreview(null);
    }
  }, [previewOnHover, previewLocked, preview?.id]);

  useEffect(() => {
    return () => {
      Object.values(purchaseFeedbackTimersRef.current).forEach((timerId) => {
        if (timerId) window.clearTimeout(timerId);
      });
      purchaseFeedbackTimersRef.current = {};
    };
  }, []);

  const pulsePurchaseFeedback = (id, state, durationMs = 1000) => {
    setPurchaseFeedback((prev) => {
      if (purchaseFeedbackTimersRef.current[id]) {
        window.clearTimeout(purchaseFeedbackTimersRef.current[id]);
      }
      const timerId = window.setTimeout(() => {
        setPurchaseFeedback((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
        delete purchaseFeedbackTimersRef.current[id];
      }, durationMs);
      purchaseFeedbackTimersRef.current[id] = timerId;
      return {
        ...prev,
        [id]: { state },
      };
    });
  };

  const stageId = String(dog?.lifeStage?.stage || "PUPPY").toUpperCase();
  const fallbackSprite = useMemo(
    () => getSpriteForStageAndTier(stageId, dog?.cleanlinessTier),
    [dog?.cleanlinessTier, stageId]
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

  const totalCatalogCount = Array.isArray(catalog) ? catalog.length : 0;
  const trimmedQuery = String(query || "").trim();
  const hasActiveFilters =
    trimmedQuery.length > 0 ||
    categoryFilter !== "all" ||
    ownedFilter !== "all" ||
    affordFilter !== "all" ||
    sortKey !== "recommended";

  const backdropLayers = useMemo(
    () =>
      resolveBackdropLayers({
        backdropId: selectedBackdrop || "default",
        environment: "yard",
        preview: true,
        weather: "clear",
        isNight: false,
        sunriseProgress: 0,
      }),
    [selectedBackdrop]
  );

  const catalogItems = useMemo(() => {
    const items = Array.isArray(catalog) ? catalog : [];
    const q = trimmedQuery.toLowerCase();
    const isEquippedItem = (it) => {
      const slot = String(it?.slot || "").toLowerCase();
      const id = String(it?.id || "").trim();
      if (!slot || !id) return false;
      return equipped?.[slot] === id;
    };

    const filtered = items
      .filter((it) => it && typeof it === "object")
      .filter((it) => {
        const id = String(it.id || "").trim();
        if (!id) return false;
        if (it?.founderOnly && !isFounder && !unlocked.has(id)) return false;

        const category = getStoreCategory(it);
        if (categoryFilter !== "all" && category !== categoryFilter)
          return false;

        const owned = unlocked.has(id);
        if (ownedFilter === "owned" && !owned) return false;
        if (ownedFilter === "unowned" && owned) return false;

        const price = priceForCatalogItem(it);
        const currency = getCurrencyForItem(it);
        const balance = currency === "gems" ? gems : coins;
        const afford = !it?.iap && balance >= price;
        if (affordFilter === "affordable" && !afford) return false;

        if (q) {
          const label = String(it.label || id).toLowerCase();
          const slotText = String(it.slot || "").toLowerCase();
          const categoryText = getStoreCategory(it);
          if (
            !label.includes(q) &&
            !id.toLowerCase().includes(q) &&
            !slotText.includes(q) &&
            !categoryText.includes(q)
          )
            return false;
        }

        return true;
      });

    const sorted = [...filtered];
    const slotRank = (s) =>
      s === "collar"
        ? 0
        : s === "tag"
          ? 1
          : s === "backdrop"
            ? 2
            : s === "toy"
              ? 3
              : s === "consumable"
                ? 4
                : s === "yard_upgrade"
                  ? 5
                  : 9;
    const categoryRank = (c) =>
      c === "toys"
        ? 0
        : c === "apparel"
          ? 1
          : c === "care"
            ? 2
            : c === "yard"
              ? 3
              : 9;

    const baseComparator = (a, b) => {
      if (sortKey === "price") {
        return priceForCatalogItem(a) - priceForCatalogItem(b);
      }
      if (sortKey === "threshold") {
        return (Number(a.threshold) || 0) - (Number(b.threshold) || 0);
      }
      if (sortKey === "alpha") {
        const la = String(a.label || a.id || "");
        const lb = String(b.label || b.id || "");
        return la.localeCompare(lb, undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }

      // recommended: slot grouping + threshold
      const sa = String(a.slot || "").toLowerCase();
      const sb = String(b.slot || "").toLowerCase();
      const ca = getStoreCategory(a);
      const cb = getStoreCategory(b);
      const cra = categoryRank(ca);
      const crb = categoryRank(cb);
      if (cra !== crb) return cra - crb;
      const ra = slotRank(sa);
      const rb = slotRank(sb);
      if (ra !== rb) return ra - rb;
      return (Number(a.threshold) || 0) - (Number(b.threshold) || 0);
    };

    sorted.sort((a, b) => {
      if (showEquippedFirst) {
        const ea = isEquippedItem(a) ? 0 : 1;
        const eb = isEquippedItem(b) ? 0 : 1;
        if (ea !== eb) return ea - eb;
      }
      return baseComparator(a, b);
    });

    return sorted;
  }, [
    affordFilter,
    catalog,
    coins,
    gems,
    equipped,
    ownedFilter,
    showEquippedFirst,
    categoryFilter,
    sortKey,
    trimmedQuery,
    unlocked,
    isFounder,
  ]);

  const focusedItem = useMemo(() => {
    const id = String(focusedId || preview?.id || "").trim();
    if (!id) return null;
    return (
      (Array.isArray(catalog) ? catalog : []).find(
        (it) => String(it?.id || "").trim() === id
      ) || null
    );
  }, [catalog, focusedId, preview?.id]);

  const streakDays = Math.max(
    0,
    Math.floor(Number(nextRewardInfo?.streakDays) || 0)
  );
  const nextReward = nextRewardInfo?.next || null;

  const featuredDeal = useMemo(() => {
    const items = Array.isArray(catalog) ? catalog : [];
    const unownedAffordable = items
      .filter((it) => it && typeof it === "object")
      .filter((it) => {
        const id = String(it?.id || "").trim();
        if (!id) return false;
        if (it?.founderOnly && !isFounder && !unlocked.has(id)) return false;
        if (it?.iap) return false;
        if (unlocked.has(id)) return false;
        const price = priceForCatalogItem(it);
        const currency = getCurrencyForItem(it);
        const balance = currency === "gems" ? gems : coins;
        return balance >= price;
      })
      .sort((a, b) => priceForCatalogItem(a) - priceForCatalogItem(b));

    return unownedAffordable[0] || null;
  }, [catalog, coins, gems, isFounder, unlocked]);

  const canHoverPreview = previewOnHover && !previewLocked;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <PageHeader
        className="sticky top-0 z-30 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md"
        unstyled
      >
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
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold">
              <span className="text-sky-200">Gems</span>
              <span className="tabular-nums">{gems}</span>
            </span>
            <BackPill to="/game" label="Back to Yard" />
          </div>
        </div>
      </PageHeader>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* Hero */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-black/25 p-6 overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Doggerz Store
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200">
                Dress your pup. Flex your streak.
              </div>
              <div className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-2xl">
                Try cosmetics before buying, unlock freebies by keeping your
                streak alive, and swap your look instantly. (No buyer’s
                remorse—your pup can’t judge you. Probably.)
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
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                How to earn coins
              </div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">
                Care = currency
              </div>
              <div className="mt-2 text-sm text-zinc-300">
                Feed, play, train, and keep routines consistent. The Store is
                optional—streak rewards are the chill path.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Try-on tips
              </div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">
                Hover to preview
              </div>
              <div className="mt-2 text-sm text-zinc-300">
                Hover items to preview instantly, then pin a look to compare.
                Click an item for details. Buy + auto-equip anytime.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Coming soon
              </div>
              <div className="mt-1 text-sm font-extrabold text-zinc-100">
                More cosmetics
              </div>
              <div className="mt-2 text-sm text-zinc-300">
                New collars, tags, and animated rewards are on the way. Your
                streak will matter.
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Discoveries
              </div>
              <div className="mt-1 text-lg font-extrabold text-zinc-100">
                Treasure stash
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              Total found:{" "}
              <span className="font-semibold text-amber-100">
                {totalTreasuresFound}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {foundTreasures.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Treasure
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-zinc-100">
                      {item.label}
                    </div>
                  </div>
                  <div className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </div>
                </div>
                <div className="mt-3 text-xs text-zinc-300">{item.flavor}</div>
                <div className="mt-4 inline-flex items-center rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                  Owned: {item.count}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Economy map
              </div>
              <div className="mt-1 text-lg font-extrabold text-zinc-100">
                Category design and stat impact
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              Starter freebies: Basic Tennis Ball + Plain Red Collar.
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(STORE_CATEGORY_META).map(([id, meta]) => (
              <div
                key={id}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {meta.label}
                </div>
                <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                  {meta.impact}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Subscription
            </div>
            <div className="mt-1 text-xl font-extrabold text-emerald-200">
              PAWPASS
            </div>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Optional membership with monthly perks and surprise drops.
              Designed for players who want extra goodies without grinding.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
              Coming soon
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-6 lg:col-span-2">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Surprise boxes
            </div>
            <div className="mt-1 text-xl font-extrabold text-zinc-100">
              Open for rewards
            </div>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Four ways to earn drops. Some are free from gameplay, some are
              seasonal, and some are premium.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                  Common
                </div>
                <div className="mt-1 text-sm font-extrabold text-emerald-100">
                  Coins box
                </div>
                <div className="mt-1 text-xs text-zinc-300">
                  Steady coin drops for regular play.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                  Rare
                </div>
                <div className="mt-1 text-sm font-extrabold text-sky-100">
                  Premium box
                </div>
                <div className="mt-1 text-xs text-zinc-300">
                  Higher-tier cosmetics and special items.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                  Event
                </div>
                <div className="mt-1 text-sm font-extrabold text-amber-100">
                  Seasonal box
                </div>
                <div className="mt-1 text-xs text-zinc-300">
                  Limited-time rewards tied to holidays and themes.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                  Achievement
                </div>
                <div className="mt-1 text-sm font-extrabold text-violet-100">
                  Free gameplay box
                </div>
                <div className="mt-1 text-xs text-zinc-300">
                  Earned by milestones and badges. No paywall.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Members
            </div>
            <div className="mt-1 text-xl font-extrabold text-zinc-100">
              Kennel Club
            </div>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Exclusive activities and content for club members: curated events,
              premium training lanes, and special hangouts you can’t access
              anywhere else.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-semibold text-zinc-200">
              Members-only
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
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                        Preview
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-zinc-100">
                        Your pup, dressed up
                      </div>
                    </div>
                    {preview?.id ? (
                      <div className="flex items-center gap-2">
                        {!previewLocked ? (
                          <button
                            type="button"
                            className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                            onClick={() => setPreviewLocked(true)}
                          >
                            Pin preview
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                          onClick={() => {
                            setPreview(null);
                            setPreviewLocked(false);
                          }}
                        >
                          {previewLocked ? "Clear try-on" : "Clear preview"}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 overflow-hidden">
                    <div className="relative h-[360px] sm:h-[420px]">
                      {backdropLayers.map((layer) => (
                        <div
                          key={layer.key}
                          className="absolute inset-0"
                          style={layer.style}
                        />
                      ))}
                      <div className="absolute inset-0 bg-black/25" />

                      <div className="absolute inset-0 grid place-items-center">
                        <div
                          className="relative"
                          style={{ width: 360, height: 360 }}
                        >
                          <SpriteSheetDog
                            stage={stageId}
                            anim={"idle"}
                            facing={1}
                            size={360}
                            reduceMotion={false}
                            fallbackSrc={fallbackSprite}
                            className="select-none"
                            onDebug={
                              import.meta.env.DEV ? setSpriteDebug : undefined
                            }
                          />
                          <div className="pointer-events-none absolute inset-0">
                            <DogCosmeticsOverlay
                              equipped={previewEquipped}
                              size={360}
                              stage={stageId}
                              facing={1}
                              showEditorUi
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                        <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="text-zinc-200">
                              Equipped:
                              <span className="ml-2 text-emerald-200 font-semibold">
                                Collar
                              </span>
                              <span className="ml-1 text-zinc-100">
                                {equipped?.collar
                                  ? titleCase(
                                      String(equipped.collar).replace(
                                        /^collar_/,
                                        ""
                                      )
                                    )
                                  : "None"}
                              </span>
                              <span className="mx-2 text-zinc-600">•</span>
                              <span className="text-emerald-200 font-semibold">
                                Tag
                              </span>
                              <span className="ml-1 text-zinc-100">
                                {equipped?.tag
                                  ? titleCase(
                                      String(equipped.tag).replace(/^tag_/, "")
                                    )
                                  : "None"}
                              </span>
                            </div>
                            <div className="text-zinc-300">
                              Unlocked:{" "}
                              <span className="font-semibold text-zinc-100">
                                {unlocked.size}
                              </span>
                            </div>
                          </div>

                          {import.meta.env.DEV ? (
                            <div className="mt-2 text-[11px] text-zinc-400">
                              Sprite:{" "}
                              <span className="font-semibold text-zinc-200">
                                {spriteDebug?.sheetLoaded
                                  ? "anim strip"
                                  : "fallback"}
                              </span>
                              {spriteDebug?.sheetFailed ? (
                                <span className="text-amber-200">
                                  {" "}
                                  · strip failed
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-zinc-300 leading-relaxed">
                    Buy items with coins, claim starter freebies, and unlock
                    selected rewards from streak milestones. Try-on previews
                    only affect wearable items.
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    {previewLocked
                      ? "Preview pinned. Keep browsing to compare."
                      : "Tip: pin a preview to keep it while you browse."}
                  </div>

                  {focusedItem
                    ? (() => {
                        const id = String(focusedItem?.id || "").trim();
                        if (!id) return null;
                        const slot = String(
                          focusedItem?.slot || "cosmetic"
                        ).toLowerCase();
                        const category = getStoreCategory(focusedItem);
                        const label = String(focusedItem?.label || id);
                        const threshold = clamp(
                          Number(focusedItem?.threshold || 0),
                          0,
                          9999
                        );
                        const price = priceForCatalogItem(focusedItem);
                        const iapLabel = String(focusedItem?.iap || "").trim();
                        const isIapOnly = Boolean(iapLabel);
                        const currency = getCurrencyForItem(focusedItem);
                        const balance = currency === "gems" ? gems : coins;
                        const owned = unlocked.has(id);
                        const afford = !isIapOnly && balance >= price;
                        const isEquipped = slot && equipped?.[slot] === id;
                        const wearable = WEARABLE_SLOTS.has(slot);
                        const rarity = rarityForThreshold(threshold);

                        const progress =
                          threshold > 0
                            ? clamp(streakDays / threshold, 0, 1)
                            : 1;
                        const daysLeft = Math.max(
                          0,
                          Math.ceil(threshold - streakDays)
                        );

                        return (
                          <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <SlotPill slot={slot} />
                                  <CategoryPill category={category} />
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rarity.className}`}
                                  >
                                    {rarity.label}
                                  </span>
                                </div>
                                <div className="mt-2 truncate text-base font-extrabold text-zinc-100">
                                  {label}
                                </div>
                                <div className="mt-1 text-xs text-zinc-400">
                                  {cosmeticDescription(focusedItem)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-zinc-400">
                                  {isIapOnly ? "IAP" : "Price"}
                                </div>
                                <div className="mt-1 text-sm font-extrabold tabular-nums text-emerald-200">
                                  {isIapOnly
                                    ? iapLabel
                                    : price > 0
                                      ? `${price} ${currency}`
                                      : "Free"}
                                </div>
                                <div className="mt-2 text-[11px] text-zinc-500">
                                  {threshold > 0
                                    ? `Free at day ${threshold}`
                                    : "Starter / direct unlock"}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                <span>Streak progress</span>
                                <span className="tabular-nums text-zinc-200">
                                  {Math.min(streakDays, threshold)}/
                                  {threshold || 0}
                                  {threshold ? (
                                    <span className="text-zinc-500">
                                      {" "}
                                      ·{" "}
                                      {daysLeft === 0
                                        ? "Eligible"
                                        : `${daysLeft}d left`}
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
                                onClick={() => {
                                  if (!wearable) return;
                                  setPreview({ slot, id });
                                  setPreviewLocked(true);
                                }}
                              >
                                {wearable ? "Try on" : "Details"}
                              </button>

                              {owned ? (
                                wearable ? (
                                  <button
                                    type="button"
                                    className={`rounded-2xl px-4 py-3 text-xs font-bold transition ${
                                      isEquipped
                                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                                        : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                                    }`}
                                    onClick={() => {
                                      if (!slot) return;
                                      dispatch(equipCosmetic({ slot, id }));
                                      toast.success(
                                        isEquipped
                                          ? "Already equipped."
                                          : `Equipped ${label}.`,
                                        1400
                                      );
                                    }}
                                  >
                                    {isEquipped ? "Equipped" : "Equip"}
                                  </button>
                                ) : slot === "toy" ? (
                                  <button
                                    type="button"
                                    className={`rounded-2xl px-4 py-3 text-xs font-bold transition ${
                                      activeToyId === id
                                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                                        : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                                    }`}
                                    onClick={() => {
                                      dispatch(setActiveToy({ toyId: id }));
                                      toast.success(
                                        activeToyId === id
                                          ? "Already active."
                                          : `Active toy set: ${label}.`,
                                        1400
                                      );
                                    }}
                                  >
                                    {activeToyId === id
                                      ? "Active"
                                      : "Set active"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="rounded-2xl px-4 py-3 text-xs font-bold border border-white/15 bg-black/25 text-zinc-300 opacity-80"
                                  >
                                    Owned
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  disabled={!afford || isIapOnly}
                                  onClick={() => {
                                    if (!afford || isIapOnly) return;
                                    dispatch(
                                      purchaseCosmetic({
                                        id,
                                        price,
                                        currency,
                                        now: Date.now(),
                                      })
                                    );

                                    // QoL: auto-equip on purchase for wearable slots.
                                    if (WEARABLE_SLOTS.has(slot)) {
                                      dispatch(equipCosmetic({ slot, id }));
                                    }

                                    toast.success(`Purchased ${label}.`, 1600);
                                  }}
                                  className={`rounded-2xl px-4 py-3 text-xs font-bold transition active:scale-[0.99] ${
                                    afford && !isIapOnly
                                      ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/25 hover:bg-emerald-500/25"
                                      : "bg-white/5 text-zinc-500 cursor-not-allowed"
                                  }`}
                                >
                                  {isIapOnly
                                    ? "Buy in game panel"
                                    : afford
                                      ? "Buy"
                                      : "Not enough"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    : null}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      Wallet
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-emerald-200 tabular-nums">
                      {coins} coins
                    </div>
                    <div className="mt-1 text-sm font-bold text-sky-200 tabular-nums">
                      {gems} gems
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                  >
                    Manage settings
                  </Link>
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  Tip: starter gear is free, streak rewards unlock over time,
                  and coins cover most upgrades.
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      Progress
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-zinc-100">
                      Streak rewards
                    </div>
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
                        <div className="text-xs text-zinc-400">
                          Next free unlock
                        </div>
                        <div className="mt-1 truncate text-sm font-extrabold text-emerald-200">
                          {nextReward.label || nextReward.id}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Day {nextReward.threshold}
                        </div>
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
                          Math.ceil(
                            (Number(nextReward.threshold) || 0) - streakDays
                          )
                        )}{" "}
                        day(s) left
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-zinc-400">
                    You’ve unlocked every streak cosmetic. Nice.
                  </div>
                )}

                {featuredDeal ? (
                  <div className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/90">
                      Featured deal
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-100">
                      Affordable right now
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-zinc-100">
                          {featuredDeal.label || featuredDeal.id}
                        </div>
                        <div className="mt-1 text-xs text-emerald-100/80">
                          {priceForCatalogItem(featuredDeal)}{" "}
                          {getCurrencyForItem(featuredDeal)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-2xl px-4 py-2 text-xs font-extrabold bg-emerald-400 text-black hover:bg-emerald-300 transition"
                        onClick={() => {
                          const id = String(featuredDeal?.id || "").trim();
                          const slot = String(
                            featuredDeal?.slot || ""
                          ).toLowerCase();
                          if (!id) return;
                          setFocusedId(id);
                          setPreview({ slot, id });
                          setPreviewLocked(true);
                        }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-zinc-400">
                  Earn coins by feeding, playing, training, and keeping your
                  pup’s routine consistent.
                </div>
              </section>
            </div>
          </aside>

          {/* RIGHT: Catalog */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                    Catalog
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-zinc-100">
                    Toys, apparel, care, and yard upgrades
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    title="Filter catalog by item category."
                  >
                    <option value="all">All categories</option>
                    <option value="toys">Toys</option>
                    <option value="apparel">Apparel</option>
                    <option value="care">Care & Consumables</option>
                    <option value="yard">Yard Upgrades</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={ownedFilter}
                    onChange={(e) => setOwnedFilter(e.target.value)}
                    title="Show all, owned only, or unowned only."
                  >
                    <option value="all">All</option>
                    <option value="owned">Owned</option>
                    <option value="unowned">Unowned</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={affordFilter}
                    onChange={(e) => setAffordFilter(e.target.value)}
                    title="Filter by whether current balances can afford items."
                  >
                    <option value="all">Any price</option>
                    <option value="affordable">Affordable</option>
                  </select>

                  <select
                    className="rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100"
                    value={sortKey}
                    onChange={(e) => dispatch(setStoreSortKey(e.target.value))}
                    title="Choose how catalog cards are sorted."
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="threshold">Sort: Streak day</option>
                    <option value="price">Sort: Price</option>
                    <option value="alpha">Sort: A-Z</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search toys, apparel, care, yard upgrades…"
                    className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-emerald-500/40"
                    title="Search by item name, slot, category, or id."
                  />
                  {trimmedQuery ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-black/40"
                      title="Clear the search query."
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <ToggleChip
                    active={previewOnHover}
                    onClick={() =>
                      dispatch(setStoreHoverPreview(!previewOnHover))
                    }
                    tooltip="Preview cosmetics when hovering item cards."
                  >
                    Hover preview
                  </ToggleChip>
                  <ToggleChip
                    active={showEquippedFirst}
                    onClick={() =>
                      dispatch(setStoreShowEquippedFirst(!showEquippedFirst))
                    }
                    tooltip="Pin currently equipped items near the top."
                  >
                    Equipped first
                  </ToggleChip>
                  <ToggleChip
                    active={compactCards}
                    onClick={() =>
                      dispatch(setStoreCompactCards(!compactCards))
                    }
                    tooltip="Switch between denser and roomier card layouts."
                  >
                    Compact cards
                  </ToggleChip>
                  {previewLocked ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                      Preview pinned
                    </span>
                  ) : null}
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("all");
                        setOwnedFilter("all");
                        setAffordFilter("all");
                        dispatch(setStoreSortKey("recommended"));
                        setQuery("");
                      }}
                      className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-black/40"
                      title="Reset all active filters and sorting."
                    >
                      Clear filters
                    </button>
                  ) : null}
                  <span className="ml-auto text-zinc-400">
                    Showing {catalogItems.length}/{totalCatalogCount}
                  </span>
                </div>
              </div>

              <div
                className={`mt-5 grid grid-cols-1 sm:grid-cols-2 ${
                  compactCards ? "gap-3" : "gap-4"
                }`}
              >
                {catalogItems.map((item) => {
                  const id = String(item?.id || "").trim();
                  if (!id) return null;

                  const slot = String(item?.slot || "cosmetic").toLowerCase();
                  const category = getStoreCategory(item);
                  const label = String(item?.label || id);
                  const threshold = clamp(
                    Number(item?.threshold || 0),
                    0,
                    9999
                  );

                  const price = priceForCatalogItem(item);
                  const iapLabel = String(item?.iap || "").trim();
                  const isIapOnly = Boolean(iapLabel);
                  const currency = getCurrencyForItem(item);
                  const balance = currency === "gems" ? gems : coins;
                  const owned = unlocked.has(id);
                  const afford = !isIapOnly && balance >= price;
                  const isEquipped = slot && equipped?.[slot] === id;
                  const wearable = WEARABLE_SLOTS.has(slot);
                  const rarity = rarityForThreshold(threshold);
                  const feedbackState = purchaseFeedback[id]?.state || "";
                  const streakProgress =
                    threshold > 0 ? clamp(streakDays / threshold, 0, 1) : 0;
                  const buttonSize = compactCards ? "px-3 py-2" : "px-4 py-3";
                  const titleSize = compactCards ? "text-sm" : "text-base";
                  const descSize = compactCards ? "text-[11px]" : "text-xs";

                  return (
                    <div
                      key={id}
                      className={`rounded-3xl border border-white/10 bg-black/30 transition hover:bg-black/35 ${
                        compactCards ? "p-4" : "p-5"
                      }`}
                      onMouseEnter={() => {
                        if (!canHoverPreview) return;
                        setPreview({ slot, id });
                        setFocusedId(id);
                      }}
                      onMouseLeave={() => {
                        if (!canHoverPreview) return;
                        setPreview((p) => (p?.id === id ? null : p));
                      }}
                      onClick={() => setFocusedId(id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SlotPill slot={slot} />
                            <CategoryPill category={category} />
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rarity.className}`}
                            >
                              {rarity.label}
                            </span>
                          </div>
                          <div
                            className={`mt-2 truncate font-extrabold text-zinc-100 ${titleSize}`}
                          >
                            {label}
                          </div>
                          <div className={`mt-1 text-zinc-400 ${descSize}`}>
                            {cosmeticDescription(item)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-zinc-400">
                            {isIapOnly ? "IAP" : "Price"}
                          </div>
                          <div className="mt-1 text-sm font-bold tabular-nums text-emerald-200">
                            {isIapOnly
                              ? iapLabel
                              : price > 0
                                ? `${price} ${currency}`
                                : "Free"}
                          </div>
                          <div className="mt-2 text-[11px] text-zinc-500">
                            {threshold > 0
                              ? `Streak day ${threshold}`
                              : "Starter / direct unlock"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Free unlock progress</span>
                          <span className="tabular-nums">
                            {Math.min(streakDays, threshold)}/{threshold || 0}
                          </span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={streakProgress} />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`rounded-2xl text-xs font-bold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition ${buttonSize}`}
                          title={
                            wearable
                              ? `Preview ${label} on your pup.`
                              : `Open details for ${label}.`
                          }
                          onClick={() => {
                            if (!wearable) return;
                            setPreview({ slot, id });
                            setPreviewLocked(true);
                          }}
                        >
                          {wearable ? "Try on" : "Details"}
                        </button>

                        {owned ? (
                          wearable ? (
                            <button
                              type="button"
                              className={`rounded-2xl text-xs font-bold transition ${buttonSize} ${
                                isEquipped
                                  ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                                  : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                              }`}
                              title={
                                isEquipped
                                  ? `${label} is currently equipped.`
                                  : `Equip ${label}.`
                              }
                              onClick={() => {
                                if (!slot) return;
                                dispatch(equipCosmetic({ slot, id }));
                                toast.success(
                                  isEquipped
                                    ? "Already equipped."
                                    : `Equipped ${label}.`,
                                  1400
                                );
                              }}
                            >
                              {isEquipped ? "Equipped" : "Equip"}
                            </button>
                          ) : slot === "toy" ? (
                            <button
                              type="button"
                              className={`rounded-2xl text-xs font-bold transition ${buttonSize} ${
                                activeToyId === id
                                  ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                                  : "border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
                              }`}
                              title={
                                activeToyId === id
                                  ? `${label} is already the active toy.`
                                  : `Set ${label} as active toy.`
                              }
                              onClick={() => {
                                dispatch(setActiveToy({ toyId: id }));
                                toast.success(
                                  activeToyId === id
                                    ? "Already active."
                                    : `Active toy set: ${label}.`,
                                  1400
                                );
                              }}
                            >
                              {activeToyId === id ? "Active" : "Set active"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className={`rounded-2xl text-xs font-bold border border-white/15 bg-black/25 text-zinc-300 opacity-80 ${buttonSize}`}
                            >
                              Owned
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            disabled={isIapOnly}
                            title={
                              isIapOnly
                                ? `${label} is sold through in-game purchase flow.`
                                : afford
                                  ? `Buy ${label} for ${price} ${currency}.`
                                  : `Need ${Math.max(0, price - balance)} more ${currency}.`
                            }
                            onClick={() => {
                              if (isIapOnly) return;
                              if (!afford) {
                                pulsePurchaseFeedback(id, "poor", 600);
                                toast.error(
                                  `Need ${Math.max(0, price - balance)} more ${currency}.`,
                                  900
                                );
                                return;
                              }
                              dispatch(
                                purchaseCosmetic({
                                  id,
                                  price,
                                  currency,
                                  now: Date.now(),
                                })
                              );

                              // QoL: auto-equip on purchase for wearable slots.
                              if (WEARABLE_SLOTS.has(slot)) {
                                dispatch(equipCosmetic({ slot, id }));
                              }

                              pulsePurchaseFeedback(id, "bought", 1000);
                              toast.success(`Purchased ${label}.`, 1600);
                            }}
                            className={`rounded-2xl text-xs font-bold transition active:scale-[0.99] ${buttonSize} ${
                              feedbackState === "bought"
                                ? "bg-emerald-400 text-black border border-emerald-200"
                                : feedbackState === "poor"
                                  ? "bg-rose-500 text-white border border-rose-300 animate-[dgShakeHorizontal_0.36s_ease-in-out]"
                                  : afford && !isIapOnly
                                    ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/25 hover:bg-emerald-500/25"
                                    : "bg-white/5 text-zinc-500 cursor-not-allowed"
                            }`}
                          >
                            {feedbackState === "bought"
                              ? "BOUGHT!"
                              : feedbackState === "poor"
                                ? "Need coins"
                                : isIapOnly
                                  ? "Buy in game panel"
                                  : afford
                                    ? "Buy"
                                    : "Not enough"}
                          </button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{owned ? "Owned" : "Not owned"}</span>
                        <span className="tabular-nums">
                          Balance after:{" "}
                          {owned
                            ? `${balance} ${currency}`
                            : `${Math.max(0, balance - price)} ${currency}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {catalogItems.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-6 text-sm text-zinc-300">
                  <div className="text-base font-semibold text-zinc-100">
                    No matches found
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Try broadening your filters or clearing search.
                  </div>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("all");
                        setOwnedFilter("all");
                        setAffordFilter("all");
                        dispatch(setStoreSortKey("recommended"));
                        setQuery("");
                      }}
                      className="mt-4 rounded-2xl border border-white/15 bg-black/25 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-black/35"
                      title="Reset all active filters and sorting."
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : null}

              {(!catalog || catalog.length === 0) && (
                <div className="mt-6 text-sm text-zinc-400">
                  No items yet — coming soon.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
