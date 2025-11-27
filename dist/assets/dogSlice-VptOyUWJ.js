import { F as O, H as C, C as N, I as $, J as U } from "./index-ClZwlZUg.js";
const u = (e, n = 0, l = 100) =>
    Math.max(n, Math.min(l, Number.isFinite(e) ? e : 0)),
  H = { hunger: 8, happiness: 6, energy: 5, cleanliness: 3 },
  j = 0.65,
  G = 60,
  w = 100,
  R = 50,
  _ = 60 * 1e3,
  D = 60 * _,
  L = 24 * D,
  B = 4,
  i = () => Date.now(),
  f = (e) => new Date(e).toISOString().slice(0, 10),
  q = (e, n) => (e ? (n - e) / L : 1 / 0),
  X = (e, n) => (e ? q(e, n) * B : 0),
  J = () => ({ hunger: 100, happiness: 100, energy: 100, cleanliness: 100 }),
  V = () => ({
    obedience: {
      sit: { level: 0, xp: 0 },
      stay: { level: 0, xp: 0 },
      rollOver: { level: 0, xp: 0 },
      speak: { level: 0, xp: 0 },
    },
  }),
  I = () => ({
    traits: { clingy: 0, toyObsessed: 0, foodMotivated: 0 },
    primaryLabel: null,
    secondaryLabel: null,
    revealReady: !1,
    revealedAt: null,
    lastEvaluatedAt: null,
  }),
  z = () => ({ current: 0, best: 0, lastDate: null }),
  x = () => ({ lastMoodSampleAt: null, lastTag: "neutral", samples: [] }),
  F = () => ({
    lastFedAt: null,
    lastPlayedAt: null,
    lastRestedAt: null,
    lastBathAt: null,
    lastPottyAt: null,
    lastAccidentAt: null,
    lastTrainingAt: null,
    lastSeenAt: null,
  }),
  K = () => ({
    puppy: { potty: { successes: 0, attempts: 0, completedAt: null } },
    adult: {
      obedienceDrill: {
        lastDrillDate: null,
        streak: 0,
        longestStreak: 0,
        missedDays: 0,
      },
    },
  }),
  Q = () => ({ queue: [], lastPollAt: null }),
  W = () => ({ enabled: !1 }),
  k = () => ({
    id: null,
    name: "Pup",
    breed: "Jack Russell (default)",
    level: 1,
    xp: 0,
    coins: 0,
    adoptedAt: null,
    createdAt: null,
    lastUpdatedAt: null,
    lifeStage: "puppy",
    lifeStageLabel: "Puppy",
    ageDays: 0,
    stats: J(),
    cleanlinessTier: "FRESH",
    temperament: I(),
    skills: V(),
    streak: z(),
    mood: x(),
    memory: F(),
    training: K(),
    polls: Q(),
    journal: [],
    debug: W(),
  });
function a(e, n, l) {
  const t = n.createdAt ?? l ?? i(),
    s = n.id ?? `${t}-${e.journal.length}`;
  (e.journal.push({
    id: s,
    createdAt: t,
    type: n.type ?? "note",
    moodTag: n.moodTag ?? null,
    summary: n.summary ?? "",
    body: n.body ?? "",
  }),
    e.journal.length > 200 && e.journal.splice(0, e.journal.length - 200));
}
function p(e, n, l) {
  const t = e.mood || (e.mood = x()),
    s = t.lastMoodSampleAt;
  if (s && n - s < G * _) {
    t.lastTag = l || t.lastTag;
    return;
  }
  const o = {
    at: n,
    tag: l || t.lastTag || "neutral",
    hunger: e.stats.hunger,
    happiness: e.stats.happiness,
    energy: e.stats.energy,
    cleanliness: e.stats.cleanliness,
  };
  (t.samples.push(o),
    t.samples.length > 100 && t.samples.splice(0, t.samples.length - 100),
    (t.lastMoodSampleAt = n),
    (t.lastTag = o.tag));
}
function y(e, n) {
  if (!n || !Number.isFinite(n)) return;
  e.xp = Math.max(0, (e.xp ?? 0) + n);
  let l = !1;
  for (; e.xp >= w; ) ((e.xp -= w), (e.level += 1), (e.coins += 10), (l = !0));
  if (l) {
    const t = i();
    a(
      e,
      {
        type: "level-up",
        moodTag: "proud",
        summary: `Level ${e.level}`,
        body: `Your pup reached level ${e.level}!`,
      },
      t,
    );
  }
}
function Z(e, n, l) {
  if (!l) return;
  const t = e.skills?.obedience || (e.skills.obedience = {}),
    s = t[n] || (t[n] = { level: 0, xp: 0 });
  s.xp += l;
  let o = !1;
  for (; s.xp >= R; ) ((s.xp -= R), (s.level += 1), (o = !0));
  if (o) {
    const b = i();
    a(
      e,
      {
        type: "skill-up",
        moodTag: "focused",
        summary: `${n} → Lv.${s.level}`,
        body: `Your pup improved the ${n} command to level ${s.level}.`,
      },
      b,
    );
  }
}
function A(e, n) {
  if (!n) return;
  if (!e.lastDate) {
    ((e.lastDate = n), (e.current = 1), (e.best = 1));
    return;
  }
  if (e.lastDate === n) return;
  const l = new Date(e.lastDate),
    t = new Date(n);
  (Math.round((t.getTime() - l.getTime()) / L) === 1
    ? (e.current += 1)
    : (e.current = 1),
    e.current > e.best && (e.best = e.current),
    (e.lastDate = n));
}
function ee(e) {
  const n = u(e.stats.cleanliness),
    l = U || {};
  let t = "FRESH";
  (n < l.MANGE
    ? (t = "MANGE")
    : n < l.FLEAS
      ? (t = "FLEAS")
      : n < l.DIRTY
        ? (t = "DIRTY")
        : (t = "FRESH"),
    (e.cleanlinessTier = t));
}
function h(e, n, l) {
  (!e.traits[n] && e.traits[n] !== 0 && (e.traits[n] = 0),
    (e.traits[n] = u(e.traits[n] + l, 0, 100)));
}
function le(e, n) {
  const l = e.temperament || (e.temperament = I());
  if (l.lastEvaluatedAt && n - l.lastEvaluatedAt < L) return;
  const t = e.memory || F(),
    s = e.stats,
    o = t.lastFedAt != null ? (n - t.lastFedAt) / D : 1 / 0,
    b = t.lastPlayedAt != null ? (n - t.lastPlayedAt) / D : 1 / 0,
    M = t.lastSeenAt != null ? (n - t.lastSeenAt) / D : 1 / 0;
  (o < 6 && s.hunger > 70
    ? h(l, "foodMotivated", 2)
    : (o > 18 || s.hunger < 30) && h(l, "foodMotivated", -1),
    b < 6 && s.happiness > 70
      ? h(l, "toyObsessed", 2)
      : (b > 18 || s.happiness < 40) && h(l, "toyObsessed", -1),
    M > 24 || s.happiness < 40
      ? h(l, "clingy", 2)
      : M < 8 && s.happiness > 70 && h(l, "clingy", -1));
  const E = Object.entries(l.traits);
  E.sort((S, Y) => Y[1] - S[1]);
  const [c, g] = E;
  let v = null,
    P = null;
  const T = (S) => {
    switch (S) {
      case "toyObsessed":
        return "SPICY";
      case "clingy":
        return "SWEET";
      case "foodMotivated":
        return "CHILL";
      default:
        return null;
    }
  };
  (c && c[1] >= 20 && (v = T(c[0])),
    g && g[1] >= 20 && g[0] !== c[0] && (P = T(g[0])),
    (l.primaryLabel = v),
    (l.secondaryLabel = P),
    (l.lastEvaluatedAt = n));
}
function d(e, n) {
  const l = e.temperament || (e.temperament = I());
  if (!e.adoptedAt || l.revealReady) return;
  X(e.adoptedAt, n) >= 3 && ((l.revealReady = !0), (l.revealedAt = n));
}
function m(e, n, l = {}) {
  const { difficultyMultiplier: t = 1 } = l;
  if (!e.lastUpdatedAt) {
    e.lastUpdatedAt = n;
    return;
  }
  const s = n - e.lastUpdatedAt;
  if (!Number.isFinite(s) || s <= 0) return;
  const o = (s / D) * j,
    b = (e.lifeStage && C[e.lifeStage]) || {},
    E =
      ((e.cleanlinessTier && N[e.cleanlinessTier]) || {}).decayMultiplier || 1;
  (["hunger", "happiness", "energy", "cleanliness"].forEach((c) => {
    const g = H[c] || 0;
    if (!g) return;
    const v = b[`${c}DecayMultiplier`] || 1,
      T = g * v * t * E * o,
      S = e.stats[c] ?? 0;
    e.stats[c] = u(S - T);
  }),
    (e.lastUpdatedAt = n));
}
function r(e, n) {
  if ((n || (n = i()), e.adoptedAt)) {
    const l = $(e.adoptedAt, n) || {};
    ((e.lifeStage = l.lifeStage || l.stage || e.lifeStage),
      (e.lifeStageLabel = l.label || e.lifeStageLabel),
      (e.ageDays = l.ageDays ?? e.ageDays));
  } else
    ((e.lifeStage = e.lifeStage || "puppy"),
      (e.lifeStageLabel = e.lifeStageLabel || "Puppy"));
  (ee(e), le(e, n));
}
function ne(e, n) {
  !n ||
    !e.polls?.queue ||
    (e.polls.queue = e.polls.queue.filter((l) => l.id !== n));
}
const te = k(),
  se = O({
    name: "dog",
    initialState: te,
    reducers: {
      hydrateDog(e, { payload: n }) {
        const l = k(),
          t = {
            ...l,
            ...n,
            stats: { ...l.stats, ...(n?.stats || {}) },
            temperament: {
              ...l.temperament,
              ...(n?.temperament || {}),
              traits: {
                ...l.temperament.traits,
                ...(n?.temperament?.traits || {}),
              },
            },
            skills: {
              ...l.skills,
              ...(n?.skills || {}),
              obedience: {
                ...l.skills.obedience,
                ...(n?.skills?.obedience || {}),
              },
            },
            streak: { ...l.streak, ...(n?.streak || {}) },
            mood: { ...l.mood, ...(n?.mood || {}) },
            memory: { ...l.memory, ...(n?.memory || {}) },
            training: { ...l.training, ...(n?.training || {}) },
            polls: { ...l.polls, ...(n?.polls || {}) },
            debug: { ...l.debug, ...(n?.debug || {}) },
          };
        Object.assign(e, t);
        const s = i();
        (r(e, s), e.lastUpdatedAt || (e.lastUpdatedAt = s));
      },
      toggleDebug(e) {
        e.debug.enabled = !e.debug.enabled;
      },
      setDogName(e, { payload: n }) {
        e.name = (n || "").trim() || "Pup";
      },
      setAdoptedAt(e, { payload: n }) {
        const l = n ?? i();
        ((e.adoptedAt = l), e.createdAt || (e.createdAt = l), r(e, l));
      },
      feed(e, { payload: n }) {
        const l = n?.now ?? i();
        m(e, l);
        const t = n?.amount ?? 25;
        ((e.stats.hunger = u(e.stats.hunger + t)),
          (e.stats.happiness = u(e.stats.happiness + 5)),
          (e.memory.lastFedAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 10),
          p(e, l, "fed"),
          A(e.streak, f(l)),
          d(e, l),
          a(
            e,
            {
              type: "care-feed",
              moodTag: "fed",
              summary: "You fed your pup",
              body: "A meal was served. Belly: happier, life: slightly less chaotic.",
            },
            l,
          ),
          r(e, l));
      },
      play(e, { payload: n }) {
        const l = n?.now ?? i();
        m(e, l);
        const t = n?.happiness ?? 20,
          s = n?.energyCost ?? 10;
        ((e.stats.happiness = u(e.stats.happiness + t)),
          (e.stats.energy = u(e.stats.energy - s)),
          (e.memory.lastPlayedAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 10),
          p(e, l, "playful"),
          A(e.streak, f(l)),
          d(e, l),
          a(
            e,
            {
              type: "care-play",
              moodTag: "playful",
              summary: "Playtime!",
              body: "You played with your pup. Toys have feelings too, probably.",
            },
            l,
          ),
          r(e, l));
      },
      bathe(e, { payload: n }) {
        const l = n?.now ?? i();
        (m(e, l),
          (e.stats.cleanliness = 100),
          (e.stats.happiness = u(e.stats.happiness - 5)),
          (e.memory.lastBathAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 8),
          p(e, l, "fresh"),
          A(e.streak, f(l)),
          d(e, l),
          a(
            e,
            {
              type: "care-bath",
              moodTag: "fresh",
              summary: "Bath time",
              body: "Soap happened. Dignity may or may not recover.",
            },
            l,
          ),
          r(e, l));
      },
      goPotty(e, { payload: n }) {
        const l = n?.now ?? i();
        m(e, l);
        const t = e.training.puppy.potty;
        ((t.attempts += 1),
          t.successes < 8 && (t.successes += 1),
          !t.completedAt && t.successes >= 8
            ? ((t.completedAt = l),
              a(
                e,
                {
                  type: "training-potty-complete",
                  moodTag: "proud",
                  summary: "Potty training complete",
                  body: "Your pup reliably heads outside now. Accident rate will drop.",
                },
                l,
              ))
            : a(
                e,
                {
                  type: "training-potty",
                  moodTag: "relieved",
                  summary: "Successful potty break",
                  body: "You guided your pup to the right spot. Floors remain safe.",
                },
                l,
              ),
          (e.memory.lastPottyAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 12),
          p(e, l, "relieved"),
          A(e.streak, f(l)),
          d(e, l),
          r(e, l));
      },
      scoopPoop(e, { payload: n }) {
        const l = n?.now ?? i();
        (m(e, l),
          (e.stats.cleanliness = u(e.stats.cleanliness + 10)),
          (e.memory.lastAccidentAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 5),
          p(e, l, "grossed"),
          A(e.streak, f(l)),
          d(e, l),
          a(
            e,
            {
              type: "care-cleanup",
              moodTag: "grossed",
              summary: "Cleanup duty",
              body: "You handled an accident. Heroic, in a very specific way.",
            },
            l,
          ),
          r(e, l));
      },
      trainObedience(e, { payload: n }) {
        const l = n?.now ?? i(),
          t = n?.commandId || "sit";
        (m(e, l), Z(e, t, n?.xp ?? 10));
        const s = e.training.adult.obedienceDrill,
          o = f(l);
        (s.lastDrillDate !== o &&
          ((s.lastDrillDate = o),
          (s.streak += 1),
          s.streak > s.longestStreak && (s.longestStreak = s.streak)),
          (e.memory.lastTrainingAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.bonusXp ?? 5),
          p(e, l, "focused"),
          A(e.streak, o),
          d(e, l),
          a(
            e,
            {
              type: "training-obedience",
              moodTag: "focused",
              summary: `Obedience drill: ${t}`,
              body: `You practiced the ${t} command. Reps build reliable behavior.`,
            },
            l,
          ),
          r(e, l));
      },
      respondToDogPoll(e, { payload: n }) {
        const l = n?.now ?? i(),
          { pollId: t, choiceId: s } = n || {};
        (m(e, l),
          ne(e, t),
          (e.polls.lastPollAt = l),
          (e.memory.lastSeenAt = l),
          y(e, n?.xp ?? 3),
          p(e, l, "curious"),
          A(e.streak, f(l)),
          d(e, l),
          a(
            e,
            {
              type: "dog-poll",
              moodTag: "curious",
              summary: "You answered a dog poll",
              body: `Poll ${t || ""} was answered with choice ${s || ""}. Future builds can shape temperament or events from this.`,
            },
            l,
          ),
          r(e, l));
      },
      engineTick(e, { payload: n }) {
        const l = n?.now ?? i();
        n?.bladderModel;
        const t = n?.difficultyMultiplier ?? 1;
        (m(e, l, { difficultyMultiplier: t }),
          p(e, l, "tick"),
          d(e, l),
          r(e, l));
      },
    },
  }),
  ie = (e) => e.dog,
  {
    hydrateDog: re,
    toggleDebug: ae,
    setDogName: ce,
    setAdoptedAt: ue,
    feed: pe,
    play: de,
    bathe: me,
    goPotty: ge,
    scoopPoop: fe,
    trainObedience: ye,
    respondToDogPoll: Ae,
    engineTick: be,
  } = se.actions;
export { ie as s };
