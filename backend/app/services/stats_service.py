"""Dashboard statistics service.

Reads produits_PROPRES.csv, food_PROPRES.csv and tedx_PROPRE.json at startup
and computes all dashboard metrics in one pass. Results are cached in memory
so every subsequent call to get_stats() is instant.

Re-call compute() if you hot-swap the data files without restarting the server.
"""

import csv
import json
import logging
import re
from collections import Counter, defaultdict
from pathlib import Path

logger = logging.getLogger(__name__)

# ── module-level cache ────────────────────────────────────────────────────────
_stats: dict | None = None


# ── helpers ───────────────────────────────────────────────────────────────────

_LANG_PREFIX = re.compile(r"^[a-z]{2}:")


def _clean_token(s: str) -> str:
    """Strip language prefixes (fr:, en:, xx: …) and normalise to lowercase."""
    return _LANG_PREFIX.sub("", s).strip().lower()


def _parse_ingredients(raw: str) -> list[str]:
    """Split a raw ingredients string into cleaned tokens."""
    return [
        t
        for part in re.split(r"[,;|]", raw or "")
        if (t := _clean_token(part))
    ]


def _load_products_csv(path: Path, source: str) -> list[dict]:
    """Load a products CSV (code, product_name, ingredients_clean)."""
    if not path.exists():
        logger.warning("Products CSV not found: %s", path)
        return []

    products = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 3:
                continue
            code, name, ingredients_raw = row[0], row[1], row[2]
            products.append(
                {
                    "code": code.strip(),
                    "name": name.strip(),
                    "ingredients": _parse_ingredients(ingredients_raw),
                    "source": source,
                }
            )
    logger.info("Loaded %d products from %s", len(products), path.name)
    return products


def _load_tedx_json(path: Path) -> list[dict]:
    """Load the TEDX substances JSON array."""
    if not path.exists():
        logger.warning("TEDX JSON not found: %s", path)
        return []
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d TEDX substances from %s", len(data), path.name)
    return data


def _build_tedx_lookup(substances: list[dict]) -> dict[str, dict]:
    """Build a lowercase name → substance dict, longest names first for substring matching."""
    lookup: dict[str, dict] = {}
    for sub in substances:
        for name in sub.get("names", []):
            lookup[name.lower().strip()] = sub
    return lookup


def _match_product(ingredients: list[str], lookup: dict[str, dict]) -> list[dict]:
    """Return PE matches for a product's ingredient list.

    Strategy (in order):
      1. Exact match on the full token.
      2. Substring: a TedX name is wholly contained in the token.

    De-duplicated by CAS number.
    """
    seen_cas: set[str] = set()
    matched: list[dict] = []

    # Pre-sort lookup keys by length descending so longer names win on substring
    sorted_keys = sorted(lookup.keys(), key=len, reverse=True)

    for token in ingredients:
        sub = lookup.get(token)
        if sub is None:
            # Substring scan (only for names longer than 4 chars to avoid noise)
            for key in sorted_keys:
                if len(key) > 4 and key in token:
                    sub = lookup[key]
                    break
        if sub:
            cas = sub.get("cas") or sub["names"][0]
            if cas not in seen_cas:
                seen_cas.add(cas)
                matched.append(
                    {
                        "name": sub["names"][0],
                        "risk": sub["risk"],
                        "effects": sub.get("effects", []),
                        "cas": sub.get("cas", ""),
                    }
                )
    return matched


# ── category heuristics ───────────────────────────────────────────────────────

_CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("Cosmétiques (maquillage)", ["mascara", "rouge", "fond de teint", "lipstick",
                                   "foundation", "blush", "concealer", "eyeshadow",
                                   "eye shadow", "kajal", "eyeliner"]),
    ("Soins visage",             ["sérum", "serum", "crème visage", "day cream",
                                   "night cream", "face cream", "moistur", "anti-age",
                                   "antiage", "face oil", "face mask", "masque visage"]),
    ("Dentifrice",               ["dentifrice", "toothpaste", "tooth paste", "tooth gel"]),
    ("Shampoing",                ["shampoo", "shampoing", "conditioner", "après-shampoo",
                                   "hair mask", "masque cheveux"]),
    ("Gel douche",               ["gel douche", "shower gel", "body wash", "savon douche"]),
    ("Produits laitiers",        ["lait", "milk", "yaourt", "yogurt", "fromage", "cheese",
                                   "beurre", "butter", "crème fraîche", "kefir"]),
    ("Boissons",                 ["jus", "juice", "boisson", "drink", "soda", "eau",
                                   "water", "thé", "tea", "café", "coffee", "smoothie",
                                   "sirop", "nectar"]),
    ("Snacks",                   ["biscuit", "chips", "crackers", "snack", "gâteau",
                                   "cookie", "popcorn", "pretzel", "wafer", "crisp"]),
]


def _categorise(name: str) -> str | None:
    n = name.lower()
    for cat, keywords in _CATEGORY_RULES:
        if any(k in n for k in keywords):
            return cat
    return None


# ── main compute ─────────────────────────────────────────────────────────────

def compute(
    products_csv: Path,
    food_csv: Path,
    tedx_json: Path,
) -> dict:
    """Compute all dashboard statistics from the three data files.

    Returns a dict ready to be serialised as JSON.
    """
    logger.info("Computing dashboard statistics…")

    # Load raw data
    beauty_products = _load_products_csv(products_csv, source="beauty")
    food_products   = _load_products_csv(food_csv,     source="food")
    all_products    = beauty_products + food_products

    tedx_substances = _load_tedx_json(tedx_json)
    lookup          = _build_tedx_lookup(tedx_substances)

    total = len(all_products)
    if total == 0:
        logger.warning("No products loaded — returning empty stats")
        return _empty_stats()

    # Per-product matching
    pe_counter:   Counter = Counter()   # substance name → count of products
    risk_of:      dict    = {}          # substance name → risk level
    cat_totals:   defaultdict = defaultdict(lambda: [0, 0])  # cat → [total, with_pe]
    cosm_total    = cosm_pe = food_total = food_pe = 0
    with_pe_count = 0

    for p in all_products:
        matches = _match_product(p["ingredients"], lookup)
        has_pe  = bool(matches)

        if has_pe:
            with_pe_count += 1
            for m in matches:
                pe_counter[m["name"]] += 1
                risk_of[m["name"]]     = m["risk"]

        # Source split
        if p["source"] == "beauty":
            cosm_total += 1
            if has_pe:
                cosm_pe += 1
        else:
            food_total += 1
            if has_pe:
                food_pe += 1

        # Category
        cat = _categorise(p["name"])
        if cat:
            cat_totals[cat][0] += 1
            if has_pe:
                cat_totals[cat][1] += 1

    # ── Top substances (top 8 by product count) ──────────────────────────────
    top_substances = [
        {
            "name": name.title(),
            "pct": round(count / total * 100, 1),
            "risk": risk_of.get(name, "medium"),
        }
        for name, count in pe_counter.most_common(8)
    ]

    # ── By category (only cats with ≥ 10 products, sorted by % desc) ─────────
    by_category = sorted(
        [
            {
                "cat": cat,
                "pct": round(totals[1] / totals[0] * 100) if totals[0] else 0,
                "total": totals[0],
            }
            for cat, totals in cat_totals.items()
            if totals[0] >= 10
        ],
        key=lambda x: -x["pct"],
    )

    stats = {
        "totalProducts":       total,
        "totalBeauty":         cosm_total,
        "totalFood":           food_total,
        "totalSubstancesTEDX": len(tedx_substances),
        "percentWithPE":       round(with_pe_count / total * 100, 1),
        "topSubstances":       top_substances,
        "byCategory":          by_category,
        "cosmVsFood": {
            "cosm": round(cosm_pe / cosm_total * 100) if cosm_total else 0,
            "food": round(food_pe / food_total * 100) if food_total else 0,
        },
    }

    logger.info(
        "Stats ready — %d products, %.1f%% with PE, %d substances",
        total, stats["percentWithPE"], len(tedx_substances),
    )
    return stats


def _empty_stats() -> dict:
    return {
        "totalProducts": 0, "totalBeauty": 0, "totalFood": 0,
        "totalSubstancesTEDX": 0, "percentWithPE": 0.0,
        "topSubstances": [], "byCategory": [], "cosmVsFood": {"cosm": 0, "food": 0},
    }


# ── public API ────────────────────────────────────────────────────────────────

def init(products_csv: Path, food_csv: Path, tedx_json: Path) -> None:
    """Call once at app startup to populate the cache."""
    global _stats
    _stats = compute(products_csv, food_csv, tedx_json)


def get_stats() -> dict:
    """Return cached stats. Raises RuntimeError if init() was never called."""
    if _stats is None:
        raise RuntimeError("stats_service.init() has not been called yet")
    return _stats
