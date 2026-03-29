import pandas as pd
import os

print("⏳ Préparation pour affronter le fichier de 32 Go...")

# Les chemins (vérifie que le nom du fichier brut correspond bien à ce que tu as téléchargé)
chemin_brut = '../data/raw/en.openfoodfacts.org.products.csv'
chemin_propre = '../data/clean/food_PROPRES.csv'

# 1. LA TECHNIQUE USECOLS : On ne charge QUE ces 3 colonnes pour économiser 90% de la RAM !
colonnes_utiles = ['code', 'product_name', 'ingredients_tags']

# 2. On prépare le fichier de sortie en lui mettant juste les titres des colonnes
pd.DataFrame(columns=['code', 'product_name', 'ingredients_clean']).to_csv(chemin_propre, index=False)

print("🚀 Début du traitement par 'Chunks' (morceaux de 100 000 lignes)...")

# 3. LA TECHNIQUE CHUNKING : On lit le fichier tranche par tranche
lecteur_chunks = pd.read_csv(
    chemin_brut, 
    sep='\t', 
    usecols=colonnes_utiles, # <-- Le hack magique
    low_memory=False, 
    on_bad_lines='skip',
    chunksize=100000 # <-- La taille de la bouchée
)

compteur = 0

for chunk in lecteur_chunks:
    # On supprime tout de suite les produits de la tranche qui n'ont pas d'ingrédients
    chunk = chunk.dropna(subset=['ingredients_tags'])
    
    # On vérifie qu'il reste des lignes après le nettoyage
    if not chunk.empty:
        # Fonction pour nettoyer l'OCR (comme pour les cosmétiques)
        def nettoyer_tags(tags_bruts):
            texte = str(tags_bruts).lower()
            return texte.replace('en:', '').replace('-', ' ')
            
        chunk['ingredients_clean'] = chunk['ingredients_tags'].apply(nettoyer_tags)
        
        # On garde l'essentiel
        chunk_clean = chunk[['code', 'product_name', 'ingredients_clean']]
        
        # 4. On SAUVEGARDE cette tranche à la fin de notre fichier propre (mode='a' pour "append")
        chunk_clean.to_csv(chemin_propre, mode='a', header=False, index=False)
    
    compteur += 1
    print(f"✅ Tranche n°{compteur} traitée avec succès...")

print("🎉 EXPLOIT ACCOMPLI ! Le monstre de 32 Go a été filtré et converti en un petit fichier tout propre !")