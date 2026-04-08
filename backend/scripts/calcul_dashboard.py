"""
compute_stats.py — version vectorisée avec liste de blocage nutriments
Corrections :
  - NUTRIENT_BLOCKLIST étendue avec les faux positifs naturels.
  - Option A : pct des Top Substances calculé sur les produits contaminés.
  - Filtre sur la longueur des mots (> 3) et nettoyage des tirets.
"""
import pandas as pd
import json
import re
from pathlib import Path

BASE          = Path(__file__).parent
chemin_tedx   = BASE / '../data/clean/tedx_PROPRE.json'
chemin_beauty = BASE / '../data/clean/produits_PROPRES.csv'
chemin_food   = BASE / '../data/clean/food_PROPRES.csv'
chemin_sortie = BASE / '../../frontend/src/data/realData.js'

# ── BLOCKLIST ─────────────────────────────────────────────────────────────────
NUTRIENT_BLOCKLIST = {
    # Minéraux essentiels
    "iron", "zinc", "copper", "manganese", "selenium", "chromium",
    "molybdenum", "iodine", "calcium", "magnesium", "potassium",
    "phosphorus", "sodium", "fluoride",
    # Sels de minéraux courants (supplémentation)
    "zinc oxide", "zinc sulfate", "ferrous sulfate", "ferrous fumarate",
    "ferric pyrophosphate", "sodium selenite", "sodium molybdate",
    "potassium iodide", "calcium carbonate", "magnesium oxide",
    "cupric sulfate", "manganese sulfate", "chromium chloride",
    # Vitamines
    "vitamin a", "vitamin b", "vitamin c", "vitamin d", "vitamin e",
    "vitamin k", "vitamin b1", "vitamin b2", "vitamin b3", "vitamin b5",
    "vitamin b6", "vitamin b7", "vitamin b9", "vitamin b12",
    "thiamin", "thiamine", "riboflavin", "niacin", "niacinamide",
    "pantothenic acid", "pyridoxine", "biotin", "folate", "folic acid",
    "cobalamin", "retinol", "cholecalciferol", "tocopherol",
    "alpha-tocopherol", "ascorbic acid",
    # Pigments / colorants source de faux positifs
    "chinese white",   # ZnO dans peintures — pas un PE alimentaire
    "aurin",           # colorant — génère faux positifs via "laurin-" etc.
    # Macronutriments génériques
    "protein", "carbohydrate", "fat", "fiber", "sugar", "salt",
    "water", "energy",
    # --- FAUX POSITIFS NATURELS ET ALLERGÈNES À IGNORER ---
    "lemon balm", "quercetin", "sodium fluoride", "sodium selenate",
    "sodium bicarbonate", "zinc chloride", "magnesium chloride", 
    "monosodium glutamate", "benzyl salicylate", "isoeugenol", "methyl salicylate"
}

# ── 1. Chargement TEDX ───────────────────────────────────────────────────────
print("⏳ Chargement TEDX...")
with open(chemin_tedx, encoding='utf-8') as f:
    tedx_data = json.load(f)

pe_lookup = {}
for item in tedx_data:
    canon   = item['names'][0]
    risk    = item.get('risk', 'medium')
    effects = item.get('effects', [])
    for name in item['names']:
        key = name.lower().strip()
        if key in NUTRIENT_BLOCKLIST:
            continue                        # ← exclure les nutriments
        pe_lookup[key] = {'risk': risk, 'effects': effects, 'canonical': canon}

total_substances_tedx = len(tedx_data)
print(f"   {total_substances_tedx} substances TEDX — {len(pe_lookup)} synonymes actifs (nutriments exclus)")

# ── 2. Chargement CSV ────────────────────────────────────────────────────────
print("⏳ Chargement CSV produits...")
COLS = ['code', 'product_name', 'ingredients_clean']
df_beauty = pd.read_csv(chemin_beauty, header=None, names=COLS, dtype=str, on_bad_lines='skip')
df_food   = pd.read_csv(chemin_food,   header=None, names=COLS, dtype=str, on_bad_lines='skip')

df_beauty['source'] = 'beauty'
df_food['source']   = 'food'
df = pd.concat([df_beauty, df_food], ignore_index=True)

df['ingredients_clean'] = df['ingredients_clean'].fillna('')
df['product_name']      = df['product_name'].fillna('')

total_products = len(df)
total_beauty   = len(df_beauty)
total_food     = len(df_food)
print(f"   {total_products:,} produits ({total_beauty:,} cosmétiques + {total_food:,} alimentaires)")

# ── 3. Tokenisation vectorisée ───────────────────────────────────────────────
print("⏳ Tokenisation (peut prendre ~20s)...")
tokens_exploded = (
    df['ingredients_clean']
    .str.lower()
    .str.split(r'[,;|/]', regex=True)
    .explode()
    .str.replace(r'^[a-z]{2}:', '', regex=True)   # retirer fr: en: xx:
    .str.replace('-', ' ', regex=False)           # Nettoyage des tirets
    .str.strip()
)

# Filtre : ignorer les mots de 3 lettres ou moins (ex: "an", "tin")
tokens_exploded = tokens_exploded[tokens_exploded.str.len() > 3]

print(f"   {len(tokens_exploded):,} tokens extraits")

# ── 4. Matching exact token ↔ lookup PE ──────────────────────────────────────
print("⏳ Matching exact token ↔ PE (pas de substring)...")
pe_set = set(pe_lookup.keys())
matched_tokens = tokens_exploded[tokens_exploded.isin(pe_set)]
print(f"   {len(matched_tokens):,} occurrences de PE trouvées")

# ── 5. Stats par produit ─────────────────────────────────────────────────────
print("⏳ Calcul des statistiques...")
matched_df = matched_tokens.reset_index()
matched_df.columns = ['prod_idx', 'pe_token']

matched_df['canonical'] = matched_df['pe_token'].map(lambda t: pe_lookup[t]['canonical'])
matched_df['risk']      = matched_df['pe_token'].map(lambda t: pe_lookup[t]['risk'])
matched_df['effects']   = matched_df['pe_token'].map(lambda t: pe_lookup[t]['effects'])

# Dédupliquer : 1 substance par produit max
matched_df = matched_df.drop_duplicates(subset=['prod_idx', 'canonical'])

idx_with_pe      = set(matched_df['prod_idx'].unique())
produits_avec_pe = len(idx_with_pe)

src_series     = df.loc[list(idx_with_pe), 'source']
beauty_avec_pe = int((src_series == 'beauty').sum())
food_avec_pe   = int((src_series == 'food').sum())
percent_pe     = round(produits_avec_pe / total_products * 100, 1)

print(f"\n📊 Résultats :")
print(f"   Total produits      : {total_products:,}")
print(f"   Avec PE             : {produits_avec_pe:,} ({percent_pe}%)")
print(f"   Cosméto avec PE     : {beauty_avec_pe:,} / {total_beauty:,} "
      f"({round(beauty_avec_pe/total_beauty*100) if total_beauty else 0}%)")
print(f"   Alim avec PE        : {food_avec_pe:,} / {total_food:,} "
      f"({round(food_avec_pe/total_food*100) if total_food else 0}%)")

# ── Top substances ────────────────────────────────────────────────────────────
pe_counts = matched_df.groupby('canonical')['prod_idx'].nunique().sort_values(ascending=False)
top_substances = []

for canon, count in pe_counts.head(8).items():
    # OPTION A : Pourcentage calculé sur les produits contaminés
    pct  = round((count / produits_avec_pe) * 100, 1) if produits_avec_pe > 0 else 0
    info = pe_lookup.get(canon.lower(), {})
    top_substances.append({"name": canon.capitalize(), "pct": pct, "risk": info.get('risk', 'medium')})

print(f"\n   Top substances (% sur {produits_avec_pe:,} produits avec PE) :")
for s in top_substances:
    print(f"     {s['name']:40s} {s['pct']:5.1f}%  [{s['risk']}]")

# ── Effets ────────────────────────────────────────────────────────────────────
effects_exploded = (
    matched_df[['prod_idx', 'effects']]
    .explode('effects')
    .dropna(subset=['effects'])
    .query("effects != ''")
    .drop_duplicates()
)
effect_counts = effects_exploded.groupby('effects')['prod_idx'].nunique()

EFFECT_LABELS = {
    "estrogenic":   "Estrogénique",
    "androgenic":   "Androgénique",
    "thyroid":      "Thyroïde",
    "reproductive": "Reproductif",
    "cancer":       "Cancer",
    "neurological": "Neurologique",
    "immune":       "Immunitaire",
}

by_effect = sorted(
    [
        {"effect": e, "label": EFFECT_LABELS[e], "count": int(c),
         "pct": round((c / produits_avec_pe) * 100, 1) if produits_avec_pe > 0 else 0} # Option A appliquée ici aussi !
        for e, c in effect_counts.items() if e in EFFECT_LABELS
    ],
    key=lambda x: -x['count'],
)

# ── Catégories ────────────────────────────────────────────────────────────────
CATEGORIES = [
    ("Cosmétiques (maquillage)", ["mascara","lipstick","fond de teint","foundation",
                                   "blush","concealer","eyeshadow","kajal","eyeliner","vernis"]),
    ("Soins visage",             ["crème visage","sérum","serum","lotion visage","face cream",
                                   "day cream","night cream","moistur","anti-âge","anti-age",
                                   "masque visage","face mask"]),
    ("Dentifrice",               ["dentifrice","toothpaste","tooth paste",
                                   "bain de bouche","mouthwash"]),
    ("Shampoing",                ["shampoo","shampoing","après-shampoing","conditioner",
                                   "masque cheveux","hair mask"]),
    ("Gel douche",               ["gel douche","shower gel","body wash","savon douche","bain douche"]),
    ("Produits laitiers",        ["yaourt","yogurt","fromage","cheese","beurre","butter",
                                   "crème fraîche","kefir"]),
    ("Boissons",                 ["jus de","juice","boisson","soda","limonade",
                                   "smoothie","sirop","nectar","cola"]),
    ("Snacks",                   ["chocolat","biscuit","chips","snack","bonbon",
                                   "gâteau","cookie","popcorn"]),
    ("Conserves / sauces",       ["conserve","sauce tomate","soupe","ketchup",
                                   "vinaigrette","mayonnaise"]),
]

names_lower = df['product_name'].str.lower()
by_category = []
for cat_name, kws in CATEGORIES:
    mask      = names_lower.str.contains('|'.join(re.escape(k) for k in kws), regex=True, na=False)
    total_cat = int(mask.sum())
    if total_cat < 10:
        continue
    pe_in_cat = len(idx_with_pe & set(df.index[mask]))
    by_category.append({"cat": cat_name, "pct": round((pe_in_cat / total_cat) * 100) if total_cat > 0 else 0, "total": total_cat})

by_category.sort(key=lambda x: -x['pct'])

cosm_pct = round((beauty_avec_pe / total_beauty) * 100) if total_beauty else 0
food_pct = round((food_avec_pe   / total_food)   * 100) if total_food   else 0

# ── Génération realData.js ────────────────────────────────────────────────────
print("\n✅ Génération de realData.js...")
js_lines = [
    "// Généré automatiquement par compute_stats.py — ne pas modifier.\n",
    "\n",
    "export const EFFECT_CATEGORIES = {\n",
    '  thyroid:      { label: "Thyroïde",      emoji: "🦋", color: "violet"  },\n',
    '  estrogenic:   { label: "Estrogénique",  emoji: "♀️", color: "pink"    },\n',
    '  androgenic:   { label: "Androgénique",  emoji: "♂️", color: "blue"    },\n',
    '  reproductive: { label: "Reproductif",   emoji: "🧬", color: "rose"    },\n',
    '  cancer:       { label: "Cancer",        emoji: "⚠️", color: "red"     },\n',
    '  neurological: { label: "Neurologique",  emoji: "🧠", color: "amber"   },\n',
    '  immune:       { label: "Immunitaire",   emoji: "🛡️", color: "emerald" },\n',
    "};\n",
    "\n",
    "export const DASHBOARD_STATS = {\n",
    f"  totalProducts:       {total_products},\n",
    f"  totalBeauty:         {total_beauty},\n",
    f"  totalFood:           {total_food},\n",
    f"  percentWithPE:       {percent_pe},\n",
    f"  totalSubstancesTEDX: {total_substances_tedx},\n",
    f"  topSubstances:       {json.dumps(top_substances, ensure_ascii=False, indent=4)},\n",
    f"  byEffect:            {json.dumps(by_effect, ensure_ascii=False, indent=4)},\n",
    f"  byCategory:          {json.dumps(by_category, ensure_ascii=False, indent=4)},\n",
    f'  cosmVsFood:          {{ "cosm": {cosm_pct}, "food": {food_pct} }},\n',
    "};\n",
]

chemin_sortie.parent.mkdir(parents=True, exist_ok=True)
with open(chemin_sortie, 'w', encoding='utf-8') as f:
    f.writelines(js_lines)

print(f"🎉 Fichier écrit avec succès : {chemin_sortie}")