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

# Création d'un dictionnaire rapide pour chercher les PE
pe_dict = {}
for item in tedx_data:
    for name in item['names']:
        pe_dict[name] = item['effects']

# Chargement des CSV
print("   -> Lecture des cosmétiques...")
df_beauty = pd.read_csv(chemin_beauty)
print("   -> Lecture de l'alimentaire...")
df_food = pd.read_csv(chemin_food)

total_beauty = len(df_beauty)
total_food = len(df_food)
total_products = total_beauty + total_food

print(f"📊 Total analysé : {total_products} produits.")
print("🔍 Recherche des Perturbateurs Endocriniens (ça peut prendre 1 à 2 minutes)...")

# Compteurs
produits_avec_pe = 0
compteur_pe_specifiques = Counter()
compteur_risques = Counter()

# Liste de tous les noms de PE pour chercher plus vite
tous_les_noms_pe = list(pe_dict.keys())

def analyser_ingredients(df):
    global produits_avec_pe
    # On parcourt chaque produit
    for _, row in df.iterrows():
        ingredients = str(row['ingredients_clean'])
        if ingredients == 'nan':
            continue
            
        pe_trouves_dans_produit = []
        
        # On cherche si un PE est dans la liste d'ingrédients
        # (Version simplifiée pour que ça ne prenne pas 3 heures)
        for pe in tous_les_noms_pe:
            # Si le nom du PE (ex: "triclosan") est dans le texte des ingrédients
            if pe in ingredients:
                pe_trouves_dans_produit.append(pe)
                compteur_pe_specifiques[pe] += 1
                
        if len(pe_trouves_dans_produit) > 0:
            produits_avec_pe += 1
            # On ajoute les risques associés
            for pe in pe_trouves_dans_produit:
                for effect in pe_dict[pe]:
                    compteur_risques[effect] += 1

# On lance l'analyse
analyser_ingredients(df_beauty)
analyser_ingredients(df_food)

# --- CALCUL DES STATS FINALES ---
percent_pe = round((produits_avec_pe / total_products) * 100, 1) if total_products > 0 else 0

# Top 5 des PE
top_5 = [{"name": name.capitalize(), "count": count} for name, count in compteur_pe_specifiques.most_common(5)]

# Formatage des risques pour le graphique
risques_format = [{"name": effect.capitalize(), "value": count} for effect, count in compteur_risques.items()]

print("✅ Analyse terminée ! Création du fichier realData.js...")

# --- CRÉATION DU FICHIER JAVASCRIPT ---
js_content = f"""// 🚀 Fichier généré automatiquement par le script Python generate_realData.py
// Ne pas modifier à la main !

export const DASHBOARD_STATS = {{
  totalProducts: {total_products},
  totalBeauty: {total_beauty},
  totalFood: {total_food},
  percentWithPE: {percent_pe},
  topPE: {json.dumps(top_5, indent=4)},
  riskDistribution: {json.dumps(risques_format, indent=4)}
}};
"""

# Sauvegarde dans le frontend
with open(chemin_sortie_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"🎉 MAGNIFIQUE ! Le fichier {chemin_sortie_js} a été créé avec succès !")