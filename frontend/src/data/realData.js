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
// Dashboard Stats (Calculated from REAL Open Food/Beauty Facts data)
// ============================================
export const DASHBOARD_STATS = {
  totalProducts: 1288180,
  percentWithPE: 10,
  totalSubstancesTEDX: 1039,
  totalWithEffects: 1039,
  topSubstances: [
    {
        "name": "Iron",
        "pct": 67,
        "risk": "medium"
    },
    {
        "name": "Vitamin e",
        "pct": 15,
        "risk": "low"
    },
    {
        "name": "Zinc",
        "pct": 12,
        "risk": "medium"
    },
    {
        "name": "Ethanol",
        "pct": 5,
        "risk": "medium"
    },
    {
        "name": "Zinc oxide",
        "pct": 5,
        "risk": "medium"
    },
    {
        "name": "Perc",
        "pct": 4,
        "risk": "medium"
    },
    {
        "name": "Aurin",
        "pct": 4,
        "risk": "low"
    },
    {
        "name": "Manganese",
        "pct": 3,
        "risk": "low"
    }
],
  byEffect: [
    {
        "effect": "reproductive",
        "label": "Reproductif",
        "count": 97392,
        "pct": 76
    },
    {
        "effect": "androgenic",
        "label": "Androg\u00e9nique",
        "count": 23041,
        "pct": 18
    },
    {
        "effect": "cancer",
        "label": "Cancer",
        "count": 22718,
        "pct": 18
    },
    {
        "effect": "neurological",
        "label": "Neurologique",
        "count": 18823,
        "pct": 15
    },
    {
        "effect": "thyroid",
        "label": "Thyro\u00efde",
        "count": 18703,
        "pct": 15
    },
    {
        "effect": "estrogenic",
        "label": "Estrog\u00e9nique",
        "count": 14932,
        "pct": 12
    }
],
  byCategory: [
    {
        "cat": "Shampoing",
        "pct": 48
    },
    {
        "cat": "Gel douche",
        "pct": 36
    },
    {
        "cat": "Dentifrice",
        "pct": 27
    },
    {
        "cat": "Soins visage",
        "pct": 21
    },
    {
        "cat": "Snacks",
        "pct": 12
    },
    {
        "cat": "Boissons",
        "pct": 7
    },
    {
        "cat": "Conserves",
        "pct": 5
    }
],
  cosmVsFood: { "cosm": 56, "food": 9 }
};
