"""Product lookup service.

Strategy: local CSVs first (fast, offline) → Open Food/Beauty Facts API fallback.
"""

import csv
import logging
import sys
from pathlib import Path

import httpx
from fastapi import HTTPException

from app.core.config import settings

# Some CSV cells (messy OCR ingredient lists) exceed Python's default 128KB limit
csv.field_size_limit(sys.maxsize)

logger = logging.getLogger(__name__)

# Some product CSVs have massive ingredient fields — increase the limit
csv.field_size_limit(sys.maxsize)


# ═══════════════════════════════════════════
# LOCAL CSV LOOKUP
# ═══════════════════════════════════════════

def _load_csv_index(csv_path: Path, source: str) -> dict[str, dict]:
    """Load a product CSV into a barcode → product dict.

    Expected columns: code, product_name, ingredients_clean
    """
    if not csv_path.exists():
        logger.warning("Product CSV not found: %s", csv_path)
        return {}

    index: dict[str, dict] = {}
    try:
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            required = {"code", "product_name", "ingredients_clean"}
            if reader.fieldnames is None or not required.issubset(set(reader.fieldnames)):
                missing = required - set(reader.fieldnames or [])
                logger.error("CSV %s missing columns: %s", csv_path, missing)
                return {}

            for row in reader:
                code = str(row["code"]).strip()
                if not code:
                    continue

                name = (row.get("product_name") or "").strip() or "Produit inconnu"
                ingredients_raw = (row.get("ingredients_clean") or "").strip()

                # Parse ingredients: comma-separated
                ingredients = [
                    ing.strip()
                    for ing in ingredients_raw.split(",")
                    if ing.strip()
                ]

                index[code] = {
                    "barcode": code,
                    "name": name,
                    "brand": "Inconnu",
                    "category": "Inconnu",
                    "source": source,
                    "ingredients": ingredients,
                }
    except Exception as e:
        logger.error("Failed to load CSV %s: %s", csv_path, e)
        return {}

    logger.info("Loaded %d products from %s", len(index), csv_path.name)
    return index


# Load both CSVs at startup
_BEAUTY_INDEX = _load_csv_index(settings.PRODUCTS_BEAUTY_CSV, "beauty")
_FOOD_INDEX = _load_csv_index(settings.PRODUCTS_FOOD_CSV, "food")

logger.info(
    "Local product database: %d beauty + %d food = %d total",
    len(_BEAUTY_INDEX), len(_FOOD_INDEX), len(_BEAUTY_INDEX) + len(_FOOD_INDEX),
)


def _search_local(barcode: str) -> dict | None:
    """Search local CSV indexes for a product by barcode."""
    # Try food first (larger dataset usually), then beauty
    product = _FOOD_INDEX.get(barcode)
    if product:
        return product

    product = _BEAUTY_INDEX.get(barcode)
    if product:
        return product

    return None


# ═══════════════════════════════════════════
# ONLINE API FALLBACK
# ═══════════════════════════════════════════

async def _fetch_product_api(url: str, barcode: str) -> dict | None:
    """Fetch a product from an Open*Facts API. Returns the product dict or None."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{url}/{barcode}.json")
    except httpx.RequestError as exc:
        logger.warning("API request failed for %s: %s", barcode, exc)
        return None

    if resp.status_code != 200:
        return None

    data = resp.json()
    if data.get("status") != 1:
        return None
    return data.get("product")


def _parse_ingredients_api(product: dict) -> list[str]:
    """Extract a flat list of ingredient names from an OFF API response."""
    # Method 1: structured ingredients list (best quality)
    ingredients_list = product.get("ingredients", [])
    if ingredients_list:
        return [ing.get("text", ing.get("id", "")).strip()
                for ing in ingredients_list if ing.get("text") or ing.get("id")]

    # Method 2: comma-split the ingredients_text field
    text = product.get("ingredients_text", "") or ""
    if text:
        return [i.strip() for i in text.split(",") if i.strip()]

    return []


async def _search_api(barcode: str) -> dict | None:
    """Try Open Food Facts API first, then Open Beauty Facts API."""
    product = await _fetch_product_api(settings.OPEN_FOOD_FACTS_URL, barcode)
    source = "food"

    if product is None:
        product = await _fetch_product_api(settings.OPEN_BEAUTY_FACTS_URL, barcode)
        source = "beauty"

    if product is None:
        return None

    return {
        "barcode": barcode,
        "name": product.get("product_name", "Produit inconnu"),
        "brand": product.get("brands", "Marque inconnue"),
        "category": (
            product.get("categories", "Inconnu").split(",")[0].strip()
            if product.get("categories")
            else "Inconnu"
        ),
        "source": source,
        "ingredients": _parse_ingredients_api(product),
    }


# ═══════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════

async def fetch_product_info(barcode: str) -> dict:
    """Find a product: local CSVs first (fast), API as fallback (rich data).

    Returns a dict with keys: barcode, name, brand, category, source, ingredients.
    Raises HTTPException(404) if not found anywhere.
    """
    # 1. Try local CSVs first (instant, offline)
    result = _search_local(barcode)
    if result:
        logger.info("Product %s found in local CSV (%s)", barcode, result["source"])
        return result

    # 2. Fall back to live API (has brand, category, full data)
    logger.info("Product %s not in local CSV, trying live API...", barcode)
    result = await _search_api(barcode)
    if result:
        logger.info("Product %s found via API (%s)", barcode, result["source"])
        return result

    # 3. Not found anywhere
    raise HTTPException(
        status_code=404,
        detail="Produit non trouvé (ni en local, ni sur Open Food/Beauty Facts)"
    )
