// ============================================
// TEDX Substances (mock)
// ============================================
export const TEDX_SUBSTANCES = [
  { cas: "3380-34-5", names: ["triclosan", "irgasan"], risk: "high", effects: ["thyroid", "reproductive"] },
  { cas: "80-05-7", names: ["bisphenol a", "bpa"], risk: "high", effects: ["thyroid", "reproductive", "neurological"] },
  { cas: "99-76-3", names: ["methylparaben", "methyl paraben"], risk: "medium", effects: ["thyroid", "reproductive"] },
  { cas: "94-26-8", names: ["butylparaben", "butyl paraben"], risk: "high", effects: ["thyroid", "reproductive"] },
  { cas: "131-57-7", names: ["benzophenone-3", "oxybenzone"], risk: "medium", effects: ["thyroid"] },
  { cas: "84-74-2", names: ["dibutyl phthalate", "dbp"], risk: "high", effects: ["thyroid", "reproductive", "developmental"] },
  { cas: "1912-24-9", names: ["atrazine"], risk: "high", effects: ["thyroid", "reproductive"] },
  { cas: "32534-81-9", names: ["pentabromodiphenyl ether", "pbde"], risk: "high", effects: ["thyroid", "neurological"] },
  { cas: "115-96-8", names: ["tris(2-chloroethyl) phosphate", "tcep"], risk: "medium", effects: ["thyroid"] },
  { cas: "1763-23-1", names: ["pfos", "perfluorooctane sulfonate"], risk: "high", effects: ["thyroid", "immune", "reproductive"] },
];

// ============================================
// Mock Products
// ============================================
export const MOCK_PRODUCTS = {
  "3017620422003": {
    name: "Nutella 400g",
    brand: "Ferrero",
    category: "Pâte à tartiner",
    source: "food",
    ingredients: ["sugar", "palm oil", "hazelnuts", "cocoa", "skimmed milk powder", "whey powder", "soy lecithin", "vanillin"],
    matched: [
      { name: "soy lecithin", risk: "low", note: "Lécithine de soja — traces possibles de pesticides" },
      { name: "vanillin", risk: "medium", note: "Vanilline synthétique — perturbateur endocrinien suspecté" },
    ]
  },
  "3175681851849": {
    name: "Gel Douche Douceur",
    brand: "Le Petit Marseillais",
    category: "Gel douche",
    source: "beauty",
    ingredients: ["aqua", "sodium laureth sulfate", "cocamidopropyl betaine", "glycerin", "sodium chloride", "methylparaben", "triclosan", "parfum", "citric acid", "benzophenone-3"],
    matched: [
      { name: "methylparaben", risk: "medium", note: "Methylparaben — PE thyroïdien confirmé (TEDX)" },
      { name: "triclosan", risk: "high", note: "Triclosan — PE thyroïdien à haut risque (TEDX)" },
      { name: "benzophenone-3", risk: "medium", note: "Oxybenzone — PE thyroïdien confirmé (TEDX)" },
    ]
  },
  "3600523364305": {
    name: "Crème Hydratante",
    brand: "L'Oréal Paris",
    category: "Soin visage",
    source: "beauty",
    ingredients: ["aqua", "glycerin", "dimethicone", "niacinamide", "cetyl alcohol", "tocopherol", "panthenol", "allantoin"],
    matched: []
  },
  "5449000000996": {
    name: "Coca-Cola 33cl",
    brand: "The Coca-Cola Company",
    category: "Boisson gazeuse",
    source: "food",
    ingredients: ["carbonated water", "sugar", "caramel color", "phosphoric acid", "natural flavors", "caffeine"],
    matched: [
      { name: "caramel color", risk: "low", note: "Colorant caramel — sous surveillance, risque faible" },
    ]
  },
  "8001841584102": {
    name: "Dentifrice Colgate Total",
    brand: "Colgate",
    category: "Hygiène bucco-dentaire",
    source: "beauty",
    ingredients: ["aqua", "sorbitol", "hydrated silica", "sodium lauryl sulfate", "triclosan", "pvm/ma copolymer", "sodium fluoride", "flavor"],
    matched: [
      { name: "triclosan", risk: "high", note: "Triclosan — PE thyroïdien à haut risque, interdit dans certains pays (TEDX)" },
    ]
  },
};

// ============================================
// Dashboard Stats (mock)
// ============================================
export const DASHBOARD_STATS = {
  totalProducts: 3247891,
  percentWithPE: 38,
  totalSubstancesTEDX: 143,
  topSubstances: [
    { name: "Triclosan", pct: 24, risk: "high" },
    { name: "Methylparaben", pct: 19, risk: "medium" },
    { name: "BPA", pct: 16, risk: "high" },
    { name: "Benzophenone-3", pct: 12, risk: "medium" },
    { name: "Butylparaben", pct: 9, risk: "high" },
    { name: "DBP (Phthalate)", pct: 7, risk: "high" },
    { name: "PFOS", pct: 5, risk: "high" },
    { name: "Atrazine", pct: 4, risk: "high" },
  ],
  byCategory: [
    { cat: "Soins visage", pct: 52 },
    { cat: "Gel douche", pct: 47 },
    { cat: "Dentifrice", pct: 31 },
    { cat: "Shampoing", pct: 28 },
    { cat: "Snacks", pct: 22 },
    { cat: "Boissons", pct: 15 },
    { cat: "Conserves", pct: 12 },
  ],
  cosmVsFood: { cosm: 47, food: 31 },
};
