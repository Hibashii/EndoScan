# /backend/data/

Place cleaned datasets here in the `clean/` subfolder.

## Expected files in `clean/`:

### `tedx_PROPRE.json` — TEDX endocrine disrupting substances
```json
[
  {
    "cas": "3380-34-5",
    "names": ["triclosan", "irgasan"],
    "risk": "high",
    "effects": ["thyroid", "estrogenic", "reproductive"]
  }
]
```

### `produits_PROPRES.csv` — Beauty products (Open Beauty Facts)
```
code,product_name,ingredients_clean
3175681851849,Gel Douche Douceur,"aqua,sodium laureth sulfate,..."
```

### `food_PROPRES.csv` — Food products (Open Food Facts)
```
code,product_name,ingredients_clean
3017620422003,Nutella 400g,"sugar,palm oil,hazelnuts,..."
```

## Raw data
Place original unprocessed files in `raw/` (gitignored).
Run `scripts/nettoyage.py` to regenerate clean files.
