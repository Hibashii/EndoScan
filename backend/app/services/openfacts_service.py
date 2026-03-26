import httpx
from fastapi import HTTPException

from app.core.config import settings


async def _fetch_product(url: str, barcode: str) -> dict | None:
    """Fetch a product from an Open*Facts API. Returns the product dict or None."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{url}/{barcode}.json")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"External API request failed: {exc}")

    if resp.status_code != 200:
        return None

    data = resp.json()
    if data.get("status") != 1:
        return None
    return data.get("product")


def _parse_ingredients(product: dict) -> list[str]:
    """Extract a flat list of ingredient names from an OFF product dict."""
    ingredients_list = product.get("ingredients", [])
    if ingredients_list:
        return [ing.get("text", ing.get("id", "")).strip()
                for ing in ingredients_list if ing.get("text") or ing.get("id")]

    # Fallback: comma-split the ingredients_text field
    text = product.get("ingredients_text", "") or ""
    if text:
        return [i.strip() for i in text.split(",") if i.strip()]

    return []


async def fetch_product_info(barcode: str) -> dict:
    """Try Open Food Facts first, then Open Beauty Facts.

    Returns a dict with keys: name, brand, category, source, ingredients.
    Raises HTTPException(404) if not found in either database.
    """
    # Try food first
    product = await _fetch_product(settings.OPEN_FOOD_FACTS_URL, barcode)
    source = "food"

    if product is None:
        product = await _fetch_product(settings.OPEN_BEAUTY_FACTS_URL, barcode)
        source = "beauty"

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found in Open Food Facts or Open Beauty Facts")

    return {
        "barcode": barcode,
        "name": product.get("product_name", "Unknown"),
        "brand": product.get("brands", "Unknown"),
        "category": product.get("categories", "Unknown").split(",")[0].strip() if product.get("categories") else "Unknown",
        "source": source,
        "ingredients": _parse_ingredients(product),
    }
