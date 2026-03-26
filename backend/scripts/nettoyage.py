import pandas as pd
import json
import os

print("⏳ 1. Chargement des bases de données brutes...")

# Vérification/Création du dossier de sortie au cas où il n'existe pas encore
os.makedirs('../data/clean', exist_ok=True)

# 1. Chargement TEDX (Le fichier que tu as converti en CSV proprement)
print("   -> Lecture de TEDX...")
df_tedx = pd.read_csv('../data/raw/ChemicalsSearch_2026-03-22 2.csv', sep=';', low_memory=False, skiprows=1)  # skiprows=1 pour sauter la ligne d'entête incorrecte
print("🔍 Voici les vraies colonnes de TEDX :", df_tedx.columns.tolist())
# 2. Chargement OpenBeautyFacts
# On utilise sep='\t' (tabulation) et on_bad_lines='skip' pour ignorer les lignes cassées (comme la ligne 66)
print("   -> Lecture de OpenBeautyFacts (ça peut prendre un peu de temps)...")
df_produits = pd.read_csv('../data/raw/en.openbeautyfacts.org.products.csv',  sep='\t', low_memory=False, on_bad_lines='skip' )

print("✅ Fichiers chargés ! Début du nettoyage...")

# ==========================================
# ÉTAPE A : NETTOYAGE DE LA BASE TEDX (Le schéma imposé par le Front-End)
# ==========================================
print("🧪 Formatage de la base TEDX...")

# Règle 1 : CAS Number (Prendre le premier numéro avant la virgule)
def process_cas(cas_str):
    if pd.isna(cas_str): return ""
    return str(cas_str).split(',')[0].strip()

# Règle 2 : Names array (Combiner Chemical Name + Alternative Names, tout en minuscules)
def process_names(chem_name, alt_names):
    names = []
    if pd.notna(chem_name):
        names.append(str(chem_name).lower().strip())
    if pd.notna(alt_names):
        # On sépare par ; et on enlève les sauts de ligne invisibles
        alts = str(alt_names).replace('\n', '').split(';')
        names.extend([n.lower().strip() for n in alts if n.strip()])
    # On utilise set() pour enlever les doublons, puis on remet en liste
    return list(set(names))

# Règle 3 : Risk level (Compter les blocs de références séparés par \n\n)
def calculate_risk(refs):
    if pd.isna(refs): return "low"
    # On coupe à chaque double saut de ligne et on compte le nombre d'études
    papers = [p for p in str(refs).split('\n\n') if p.strip()]
    count = len(papers)
    if count >= 5: return "high"
    if count >= 2: return "medium"
    return "low"

# Règle 4 : Effects array (Mots-clés basés sur les consignes de ton équipe)
def get_effects(refs):
    if pd.isna(refs): return []
    text = str(refs).lower()
    effects = []
    
    if 'thyroid' in text: effects.append('thyroid')
    if 'estrogen' in text: effects.append('estrogenic')
    if 'androgen' in text: effects.append('androgenic')
    if any(word in text for word in ['reproductive', 'fertility', 'sperm', 'testicular', 'ovary']): 
        effects.append('reproductive')
    if any(word in text for word in ['cancer', 'tumor', 'carcinoma']): 
        effects.append('cancer')
    if 'neuro' in text or 'brain' in text: effects.append('neurological')
    if 'immune' in text: effects.append('immune')
    
    return list(set(effects))

# Application de toutes les règles sur le DataFrame
df_tedx['cas'] = df_tedx['CAS Nos.'].apply(process_cas)
df_tedx['names'] = df_tedx.apply(lambda row: process_names(row['Chemical Name'], row['Alternative Names']), axis=1)
df_tedx['risk'] = df_tedx['Endocrine Disruptor References'].apply(calculate_risk)
df_tedx['effects'] = df_tedx['Endocrine Disruptor References'].apply(get_effects)

# On garde uniquement les colonnes demandées par l'équipe
df_tedx_clean = df_tedx[['cas', 'names', 'risk', 'effects']]

# Règle finale : Exclure les substances qui n'ont AUCUN effet identifié (tableau vide)
df_tedx_clean = df_tedx_clean[df_tedx_clean['effects'].apply(len) > 0]


# ==========================================
# ÉTAPE B : NETTOYAGE DE LA BASE PRODUITS
# ==========================================
print("🧴 Nettoyage de la base Produits...")

# On supprime les produits qui n'ont pas d'ingrédients
df_produits = df_produits.dropna(subset=['ingredients_tags'])

# Fonction pour nettoyer l'OCR d'OpenBeautyFacts
def nettoyer_tags(tags_bruts):
    texte = str(tags_bruts).lower()
    # On enlève le "en:" et on remplace les tirets par des espaces
    return texte.replace('en:', '').replace('-', ' ')

df_produits['ingredients_clean'] = df_produits['ingredients_tags'].apply(nettoyer_tags)

# On garde l'essentiel
df_produits_clean = df_produits[['code', 'product_name', 'ingredients_clean']]


# ==========================================
# ÉTAPE C : SAUVEGARDE DES FICHIERS
# ==========================================
print("💾 Sauvegarde des fichiers nettoyés...")

# 🚨 Sauvegarde TEDX en JSON (Format attendu par le Front-End)
df_tedx_clean.to_json('../data/clean/tedx_PROPRE.json', orient='records', force_ascii=False, indent=2)

# Sauvegarde Produits en CSV classique
df_produits_clean.to_csv('../data/clean/produits_PROPRES.csv', index=False)

print("🎉 TERMINÉ ! Le fichier 'tedx_PROPRE.json' et 'produits_PROPRES.csv' vous attendent dans le dossier data/clean/ !")