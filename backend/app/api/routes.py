import re

from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeResponse, ProductResponse
from app.services.openfacts_service import fetch_product_info
from app.services.tedx_service import match_ingredients

router = APIRouter(prefix="/api")

BARCODE_RE = re.compile(r"^\d+$")


def _validate_barcode(barcode: str) -> None:
    if not BARCODE_RE.match(barcode):
        raise HTTPException(status_code=400, detail="Invalid barcode format (digits only)")


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
