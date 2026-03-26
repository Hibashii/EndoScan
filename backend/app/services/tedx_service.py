"""TEDX thyroid-disrupting substance matching service.

Loads substance data from CSV via data_loader. No hardcoded data.
"""

import logging

from app.core.config import settings
from app.services.data_loader import build_lookup, load_substances_from_csv

logger = logging.getLogger(__name__)

_SUBSTANCES = load_substances_from_csv(settings.TEDX_CSV_PATH)
_LOOKUP = build_lookup(_SUBSTANCES)


def reload():
    """Reload substances from CSV (call after replacing data files)."""
    global _SUBSTANCES, _LOOKUP
    _SUBSTANCES = load_substances_from_csv(settings.TEDX_CSV_PATH)
    _LOOKUP = build_lookup(_SUBSTANCES)
    logger.info("TEDX data reloaded: %d substances", len(_SUBSTANCES))


def match_ingredients(ingredients: list[str]) -> list[dict]:
    """Return matched TEDX substances from an ingredients list."""
    matched: list[dict] = []
    seen: set[str] = set()
    for ing in ingredients:
        key = ing.strip().lower()
        sub = _LOOKUP.get(key)
        if sub and sub["cas"] not in seen:
            seen.add(sub["cas"])
            risk = sub["risk"]
            label = "haut risque" if risk == "high" else "modéré" if risk == "medium" else "faible"
            matched.append({
                "name": ing.strip(),
                "risk": risk,
                "note": f"{ing.strip()} — PE thyroïdien {label} (TEDX)",
            })
    return matched
