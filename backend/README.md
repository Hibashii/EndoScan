# EndoScan Backend

FastAPI backend that fetches product data from Open Food Facts / Open Beauty Facts and cross-references ingredients with the TEDX endocrine disruptor list.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**. The Vite dev server proxies `/api` requests to this address automatically.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/product/{barcode}` | Fetch product info from Open Food/Beauty Facts |
| GET | `/api/analyze/{barcode}` | Fetch product + TEDX ingredient analysis with effects |

## API Response Example

```json
GET /api/analyze/3175681851849

{
  "barcode": "3175681851849",
  "name": "Gel Douche Douceur",
  "brand": "Le Petit Marseillais",
  "category": "Gel douche",
  "source": "beauty",
  "ingredients": ["aqua", "sodium laureth sulfate", "triclosan", ...],
  "matched": [
    {
      "name": "triclosan",
      "risk": "high",
      "effects": ["thyroid", "estrogenic", "reproductive"],
      "note": "triclosan — PE haut risque (thyroïde, estrogénique, reproductif)"
    }
  ]
}
```

## Data

Place cleaned datasets in `data/clean/`:
- `tedx_PROPRE.json` — TEDX substances (JSON, from nettoyage.py)
- `produits_PROPRES.csv` — Beauty products
- `food_PROPRES.csv` — Food products

See `data/README.md` for format details.
