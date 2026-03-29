// ============================================
// Catégories d'effets (pour l'affichage propre)
// ============================================
export const EFFECT_CATEGORIES = {
  thyroid: { label: "Thyroïde", color: "amber" },
  reproductive: { label: "Reproduction / Fertilité", color: "rose" },
  estrogenic: { label: "Système oestrogénique", color: "pink" },
  androgenic: { label: "Système androgénique", color: "blue" },
  cancer: { label: "Risque cancérigène", color: "red" },
  neurological: { label: "Neurodéveloppement", color: "purple" },
  immune: { label: "Système immunitaire", color: "teal" }
};

// ============================================
// Mock Products (démo pour la barre de recherche / scan)
// ============================================
export const MOCK_PRODUCTS = {
  "3017620422003": {
    name: "Nutella 400g", brand: "Ferrero", category: "Pâte à tartiner", source: "food",
    ingredients: ["sugar", "palm oil", "hazelnuts", "cocoa", "skimmed milk powder", "whey powder", "soy lecithin", "vanillin"],
    matched: [
      { name: "soy lecithin", risk: "low", note: "Lécithine de soja — traces possibles de pesticides" },
      { name: "vanillin", risk: "medium", note: "Vanilline synthétique — perturbateur endocrinien suspecté" },
    ]
  },
  "3175681851849": {
    name: "Gel Douche Douceur", brand: "Le Petit Marseillais", category: "Gel douche", source: "beauty",
    ingredients: ["aqua", "sodium laureth sulfate", "cocamidopropyl betaine", "glycerin", "sodium chloride", "methylparaben", "triclosan", "parfum", "citric acid", "benzophenone-3"],
    matched: [
      { name: "methylparaben", risk: "medium", note: "Methylparaben — PE thyroïdien confirmé (TEDX)" },
      { name: "triclosan", risk: "high", note: "Triclosan — PE thyroïdien à haut risque (TEDX)" },
      { name: "benzophenone-3", risk: "medium", note: "Oxybenzone — PE thyroïdien confirmé (TEDX)" },
    ]
  },
  "3600523364305": {
    name: "Crème Hydratante", brand: "L'Oréal Paris", category: "Soin visage", source: "beauty",
    ingredients: ["aqua", "glycerin", "dimethicone", "niacinamide", "cetyl alcohol", "tocopherol", "panthenol", "allantoin"],
    matched: []
  },
  "5449000000996": {
    name: "Coca-Cola 33cl", brand: "The Coca-Cola Company", category: "Boisson gazeuse", source: "food",
    ingredients: ["carbonated water", "sugar", "caramel color", "phosphoric acid", "natural flavors", "caffeine"],
    matched: [{ name: "caramel color", risk: "low", note: "Colorant caramel — sous surveillance, risque faible" }]
  },
  "8001841584102": {
    name: "Dentifrice Colgate Total", brand: "Colgate", category: "Hygiène bucco-dentaire", source: "beauty",
    ingredients: ["aqua", "sorbitol", "hydrated silica", "sodium lauryl sulfate", "triclosan", "pvm/ma copolymer", "sodium fluoride", "flavor"],
    matched: [{ name: "triclosan", risk: "high", note: "Triclosan — PE thyroïdien à haut risque, interdit dans certains pays (TEDX)" }]
  },
};