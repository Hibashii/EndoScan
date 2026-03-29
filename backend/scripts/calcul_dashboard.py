import pandas as pd
import json
import os
from collections import Counter

print("⏳ 1. Chargement des données propres...")

# Chemins (en partant du dossier scripts/)
chemin_tedx = '../data/clean/tedx_PROPRE.json'
chemin_beauty = '../data/clean/produits_PROPRES.csv'
chemin_food = '../data/clean/food_PROPRES.csv'
chemin_sortie_js = '../../frontend/src/data/realData.js'

# Chargement de TEDX
with open(chemin_tedx, 'r', encoding='utf-8') as f:
    tedx_data = json.load(f)

# Création d'un dictionnaire enrichi (avec les risques et les effets)
pe_dict = {}
for item in tedx_data:
    risk = item.get('risk', 'medium')
    effects = item.get('effects', [])
    for name in item['names']:
        pe_dict[name.lower()] = {'risk': risk, 'effects': effects}

# Stats TEDX globales
total_substances_tedx = len(tedx_data)
total_with_effects = sum(1 for item in tedx_data if len(item.get('effects', [])) > 0)

# Chargement des CSV
print("   -> Lecture des cosmétiques...")
df_beauty = pd.read_csv(chemin_beauty)
print("   -> Lecture de l'alimentaire...")
df_food = pd.read_csv(chemin_food)

total_beauty = len(df_beauty)
total_food = len(df_food)
total_products = total_beauty + total_food

print(f"📊 Total analysé : {total_products} produits.")
print("🔍 Recherche avancée (Catégories et Effets)...")

# Compteurs globaux
produits_avec_pe = 0
beauty_avec_pe = 0
food_avec_pe = 0

compteur_pe_specifiques = Counter()
compteur_effets = Counter()

# --- L'ASTUCE DATA SCIENCE : Classification par mots-clés ---
mots_cles_categories = {
    "Soins visage": ["crème", "creme", "visage", "serum", "lotion", "face", "anti-âge", "hydratant"],
    "Gel douche": ["douche", "shower", "bain", "bath", "savon", "lavant"],
    "Dentifrice": ["dentifrice", "tooth", "mouth", "dent"],
    "Shampoing": ["shampoing", "shampoo", "cheveux", "hair", "après-shampoing"],
    "Snacks": ["chocolat", "biscuit", "snack", "barre", "chips", "bonbon", "gâteau"],
    "Boissons": ["boisson", "eau", "jus", "drink", "water", "soda", "cola", "thé", "café"],
    "Conserves": ["conserve", "boite", "canned", "sauce", "soupe", "tomate"]
}

compteur_cat_total = Counter()
compteur_cat_pe = Counter()

tous_les_noms_pe = list(pe_dict.keys())

def analyser_ingredients(df, type_prod):
    global produits_avec_pe, beauty_avec_pe, food_avec_pe
    for _, row in df.iterrows():
        ingredients = str(row.get('ingredients_clean', '')).lower()
        nom_produit = str(row.get('product_name', '')).lower()
        
        if ingredients == 'nan' or not ingredients:
            continue
            
        # 1. Deviner la catégorie du produit
        cat_trouvee = None
        for cat, mots in mots_cles_categories.items():
            if any(mot in nom_produit for mot in mots):
                cat_trouvee = cat
                break
        
        if cat_trouvee:
            compteur_cat_total[cat_trouvee] += 1

        # 2. Chercher les PE
        pe_trouves = []
        for pe in tous_les_noms_pe:
            # On ignore les mots de moins de 4 lettres pour éviter les faux positifs ("an", "iron")
            if len(pe) > 3 and pe in ingredients:
                pe_trouves.append(pe)
                compteur_pe_specifiques[pe] += 1
                
        if len(pe_trouves) > 0:
            produits_avec_pe += 1
            if type_prod == 'beauty': beauty_avec_pe += 1
            else: food_avec_pe += 1
                
            if cat_trouvee:
                compteur_cat_pe[cat_trouvee] += 1
                
            # 3. Compter les effets sur la santé pour ce produit
            effets_du_produit = set()
            for pe in pe_trouves:
                for effet in pe_dict[pe]['effects']:
                    effets_du_produit.add(effet)
            
            for effet in effets_du_produit:
                compteur_effets[effet] += 1

# Lancement des moteurs
analyser_ingredients(df_beauty, 'beauty')
analyser_ingredients(df_food, 'food')

# ==========================================
# CALCUL DES STATISTIQUES FINALES
# ==========================================
percent_pe = round((produits_avec_pe / total_products) * 100) if total_products > 0 else 0

# 1. Top Substances (Calculé sur les produits contaminés pour des % lisibles)
top_substances = []
for name, count in compteur_pe_specifiques.most_common(8):
    pct = round((count / produits_avec_pe) * 100) if produits_avec_pe > 0 else 0
    risk = pe_dict[name]['risk']
    top_substances.append({"name": name.capitalize(), "pct": pct, "risk": risk})

# 2. Répartition par Effet
labels_effets = {
    "estrogenic": "Estrogénique", "androgenic": "Androgénique",
    "thyroid": "Thyroïde", "reproductive": "Reproductif",
    "cancer": "Cancer", "neurological": "Neurologique",
    "immune": "Immunitaire"
}
by_effect = []
for effect, count in compteur_effets.items():
    if effect in labels_effets:
        pct = round((count / produits_avec_pe) * 100) if produits_avec_pe > 0 else 0
        by_effect.append({
            "effect": effect,
            "label": labels_effets[effect],
            "count": count,
            "pct": pct
        })
by_effect.sort(key=lambda x: x['count'], reverse=True)

# 3. Répartition par Catégorie
by_category = []
for cat in mots_cles_categories.keys():
    total = compteur_cat_total[cat]
    pe_count = compteur_cat_pe[cat]
    pct = round((pe_count / total) * 100) if total > 0 else 0
    if pct > 0:
        by_category.append({"cat": cat, "pct": pct})
by_category.sort(key=lambda x: x['pct'], reverse=True)

# 4. Food vs Cosmétiques (Taux de contamination dans chaque secteur)
cosm_pct = round((beauty_avec_pe / total_beauty) * 100) if total_beauty > 0 else 0
food_pct = round((food_avec_pe / total_food) * 100) if total_food > 0 else 0

print("✅ Analyse terminée ! Création du fichier realData.js...")

# ==========================================
# GÉNÉRATION DU FICHIER JS
# ==========================================
js_content = f"""// ============================================
// Effect categories — the health impacts we track
// ============================================
export const EFFECT_CATEGORIES = {{
  thyroid:       {{ label: "Thyroïde",       emoji: "🦋", color: "violet" }},
  estrogenic:    {{ label: "Estrogénique",   emoji: "♀️", color: "pink" }},
  androgenic:    {{ label: "Androgénique",   emoji: "♂️", color: "blue" }},
  reproductive:  {{ label: "Reproductif",    emoji: "🧬", color: "rose" }},
  cancer:        {{ label: "Cancer",         emoji: "⚠️", color: "red" }},
  neurological:  {{ label: "Neurologique",   emoji: "🧠", color: "amber" }},
  immune:        {{ label: "Immunitaire",    emoji: "🛡️", color: "emerald" }},
}};

// ============================================
// Dashboard Stats (Calculated from REAL Open Food/Beauty Facts data)
// ============================================
export const DASHBOARD_STATS = {{
  totalProducts: {total_products},
  percentWithPE: {percent_pe},
  totalSubstancesTEDX: {total_substances_tedx},
  totalWithEffects: {total_with_effects},
  topSubstances: {json.dumps(top_substances, indent=4)},
  byEffect: {json.dumps(by_effect, indent=4)},
  byCategory: {json.dumps(by_category, indent=4)},
  cosmVsFood: {{ "cosm": {cosm_pct}, "food": {food_pct} }}
}};
"""

with open(chemin_sortie_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"🎉 MAGNIFIQUE ! Le fichier a été mis à jour avec tes vraies données et la nouvelle structure !")