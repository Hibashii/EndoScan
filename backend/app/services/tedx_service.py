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


def _load_data():
    """Try JSON first, fall back to CSV."""
    json_path = settings.TEDX_JSON_PATH
    if json_path.exists():
        return load_substances_from_json(json_path)

    # Fallback: try CSV at same location with .csv extension
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

    Returns a list of matched ingredients with:
      - name: the ingredient name as found in the product
      - risk: "high" | "medium" | "low"
      - effects: ["thyroid", "estrogenic", ...] — the health categories
      - note: human-readable description
    """
    matched: list[dict] = []
    seen_cas: set[str] = set()

    for ing in ingredients:
        key = ing.strip().lower()

        # Try exact match first
        sub = _LOOKUP.get(key)

        # Try partial match if exact fails (ingredient may contain extra text)
        if sub is None:
            for name, substance in _LOOKUP.items():
                if name in key or key in name:
                    sub = substance
                    break

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
