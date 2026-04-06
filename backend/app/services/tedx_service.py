"""TEDX endocrine disruptor matching service.

Loads substance data from JSON (primary) or CSV (fallback).
Returns matched ingredients with risk level AND effect categories.
"""

import logging

from app.core.config import settings
from app.services.data_loader import (
    build_lookup,
    load_substances_from_json,
    load_substances_from_csv,
)

logger = logging.getLogger(__name__)

# ── Effect labels for human-readable notes ──
EFFECT_LABELS = {
    "thyroid":      "thyroïde",
    "estrogenic":   "estrogénique",
    "androgenic":   "androgénique",
    "reproductive": "reproductif",
    "cancer":       "cancer",
    "neurological": "neurologique",
    "immune":       "immunitaire",
}

# ── Generic words that should NEVER be flagged as endocrine disruptors ──
# These are common food/cosmetic category tags, not chemical substances
EXCLUDED_INGREDIENTS = {
    "plant", "fat", "oil", "water", "sugar", "salt", "iron", "zinc",
    "protein", "flour", "cereal", "animal", "egg", "milk", "cream",
    "butter", "honey", "cocoa", "coffee", "tea", "fruit", "seed",
    "leaf", "root", "fiber", "starch", "acid", "alcohol", "wax",
    "vitamin e", "vitamin a", "vitamin c", "vitamin d", "vitamin b",
    "manganese", "copper", "calcium", "magnesium", "potassium",
    "sodium", "phosphorus", "selenium", "chromium", "iodine",
    "wheat", "rice", "corn", "soy", "meat", "fish", "beef",
    "chicken", "pork", "vegetable", "mineral", "colour", "color",
    "flavouring", "flavoring", "fragrance", "parfum", "aroma",
    "an", "or", "de", "le", "la", "et", "en", "du",
}


def _load_data():
    """Try JSON first, fall back to CSV."""
    json_path = settings.TEDX_JSON_PATH
    if json_path.exists():
        return load_substances_from_json(json_path)

    csv_fallback = json_path.with_suffix(".csv")
    if csv_fallback.exists():
        logger.info("JSON not found, falling back to CSV: %s", csv_fallback)
        return load_substances_from_csv(csv_fallback)

    logger.warning("No TEDX data found at %s (tried .json and .csv)", json_path)
    return []


_SUBSTANCES = _load_data()
_LOOKUP = build_lookup(_SUBSTANCES)

logger.info("TEDX service ready: %d substances, %d lookup entries", len(_SUBSTANCES), len(_LOOKUP))


def reload():
    """Reload substances from disk (call after replacing data files)."""
    global _SUBSTANCES, _LOOKUP
    _SUBSTANCES = _load_data()
    _LOOKUP = build_lookup(_SUBSTANCES)
    logger.info("TEDX data reloaded: %d substances", len(_SUBSTANCES))


def get_all_substances() -> list[dict]:
    """Return all loaded substances (for dashboard stats)."""
    return _SUBSTANCES


def match_ingredients(ingredients: list[str]) -> list[dict]:
    """Match a product's ingredients against TEDX substances.

    EXACT MATCH ONLY — no partial matching to avoid false positives
    like "plant", "fat", "iron" being flagged as endocrine disruptors.
    """
    matched: list[dict] = []
    seen_cas: set[str] = set()

    for ing in ingredients:
        key = ing.strip().lower()

        # Skip very short names (too generic to be meaningful)
        if len(key) < 4:
            continue

        # Skip known generic ingredients that are not chemicals
        if key in EXCLUDED_INGREDIENTS:
            continue

        # EXACT match only — no partial matching
        sub = _LOOKUP.get(key)

        if sub is None:
            continue

        # Skip duplicates (same substance matched by different synonym)
        cas = sub["cas"]
        if cas and cas in seen_cas:
            continue
        if cas:
            seen_cas.add(cas)

        risk = sub["risk"]
        effects = sub["effects"]

        # Build human-readable note
        effects_str = ", ".join(
            EFFECT_LABELS.get(e, e) for e in effects
        )
        risk_label = "haut risque" if risk == "high" else "modéré" if risk == "medium" else "faible"
        note = f"{ing.strip()} — PE {risk_label}"
        if effects_str:
            note += f" ({effects_str})"

        matched.append({
            "name": ing.strip(),
            "risk": risk,
            "effects": effects,
            "note": note,
        })

    return matched
