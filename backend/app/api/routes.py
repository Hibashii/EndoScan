import re

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import AnalyzeResponse, ProductResponse, SearchResult
from app.services.openfacts_service import fetch_product_info, search_products_by_name
from app.services.tedx_service import match_ingredients
from app.services import stats_service

router = APIRouter(prefix="/api")

BARCODE_RE = re.compile(r"^\d+$")


def _validate_barcode(barcode: str) -> None:
    if not BARCODE_RE.match(barcode):
        raise HTTPException(status_code=400, detail="Invalid barcode format (digits only)")


@router.get("/search", response_model=list[SearchResult])
async def search_products(q: str = Query(..., min_length=2, description="Product name to search")):
    """Search products by name in local CSVs. Returns top 10 matches."""
    results = search_products_by_name(q, limit=10)
    if not results:
        raise HTTPException(status_code=404, detail="Aucun produit trouvé pour cette recherche")
    return results


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats():
    """Return dashboard statistics computed at startup from the clean datasets.

    These numbers reflect the actual contents of:
      - backend/data/clean/produits_PROPRES.csv  (beauty products)
      - backend/data/clean/food_PROPRES.csv       (food products)
      - backend/data/clean/tedx_PROPRE.json       (PE substances)

    Restart the server (or call /api/stats/refresh) to pick up new data files.
    """
    return stats_service.get_stats()


@router.post("/stats/refresh", response_model=DashboardStats)
def refresh_stats():
    """Re-compute dashboard stats from disk without restarting the server.

    Useful after dropping updated CSV/JSON files into backend/data/clean/.
    """
    from app.core.config import settings
    stats_service.init(
        products_csv=settings.PRODUCTS_CSV_PATH,
        food_csv=settings.FOOD_CSV_PATH,
        tedx_json=settings.TEDX_JSON_PATH,
    )
    return stats_service.get_stats()


@router.get("/product/{barcode}", response_model=ProductResponse)
async def get_product(barcode: str):
    """Fetch product info from Open Food Facts / Open Beauty Facts."""
    _validate_barcode(barcode)
    info = await fetch_product_info(barcode)
    return info


@router.get("/analyze/{barcode}", response_model=AnalyzeResponse)
async def analyze_product(barcode: str):
    """Fetch product then cross-reference ingredients with TEDX endocrine disruptors."""
    _validate_barcode(barcode)
    info = await fetch_product_info(barcode)
    matched = match_ingredients(info["ingredients"])
    return {**info, "matched": matched}
