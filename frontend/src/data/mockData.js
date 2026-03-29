// ============================================
// Effect categories — the health impacts we track
// ============================================
export const EFFECT_CATEGORIES = {
  thyroid:       { label: "Thyroïde",       emoji: "🦋", color: "violet" },
  estrogenic:    { label: "Estrogénique",   emoji: "♀️", color: "pink" },
  androgenic:    { label: "Androgénique",   emoji: "♂️", color: "blue" },
  reproductive:  { label: "Reproductif",    emoji: "🧬", color: "rose" },
  cancer:        { label: "Cancer",         emoji: "⚠️", color: "red" },
  neurological:  { label: "Neurologique",   emoji: "🧠", color: "amber" },
  immune:        { label: "Immunitaire",    emoji: "🛡️", color: "emerald" },
};

// ============================================
// Dashboard Stats (mock — TODO: compute from real data later)
// ============================================
export const DASHBOARD_STATS = {
  totalProducts: 3247891,
  percentWithPE: 38,
  totalSubstancesTEDX: 1482,
  totalWithEffects: 987,
  topSubstances: [
    { name: "Triclosan",        pct: 24, risk: "high" },
    { name: "Methylparaben",    pct: 19, risk: "medium" },
    { name: "BPA",              pct: 16, risk: "high" },
    { name: "Benzophenone-3",   pct: 12, risk: "medium" },
    { name: "Butylparaben",     pct: 9,  risk: "high" },
    { name: "DBP (Phthalate)",  pct: 7,  risk: "high" },
    { name: "PFOS",             pct: 5,  risk: "high" },
    { name: "Atrazine",         pct: 4,  risk: "high" },
  ],
  byEffect: [
    { effect: "estrogenic",    label: "Estrogénique",  count: 664, pct: 45 },
    { effect: "androgenic",    label: "Androgénique",  count: 242, pct: 16 },
    { effect: "thyroid",       label: "Thyroïde",      count: 202, pct: 14 },
    { effect: "reproductive",  label: "Reproductif",   count: 109, pct: 7 },
    { effect: "cancer",        label: "Cancer",        count: 84,  pct: 6 },
    { effect: "neurological",  label: "Neurologique",  count: 65,  pct: 4 },
    { effect: "immune",        label: "Immunitaire",   count: 48,  pct: 3 },
  ],
  byCategory: [
    { cat: "Soins visage", pct: 52 },
    { cat: "Gel douche",   pct: 47 },
    { cat: "Dentifrice",   pct: 31 },
    { cat: "Shampoing",    pct: 28 },
    { cat: "Snacks",       pct: 22 },
    { cat: "Boissons",     pct: 15 },
    { cat: "Conserves",    pct: 12 },
  ],
  cosmVsFood: { cosm: 47, food: 31 },
};
