# ThyroGuard Backend

FastAPI backend that fetches product data from Open Food Facts / Open Beauty Facts and cross-references ingredients with the TEDX thyroid disruptor list.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
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
| GET | `/api/analyze/{barcode}` | Fetch product + TEDX ingredient analysis |

## Environment Variables (optional)

Copy `.env.example` to `.env` to override defaults:

```
CORS_ORIGINS=["http://localhost:5173"]
OPEN_FOOD_FACTS_URL=https://world.openfoodfacts.org/api/v2/product
OPEN_BEAUTY_FACTS_URL=https://world.openbeautyfacts.org/api/v2/product
```
