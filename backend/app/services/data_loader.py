"""Data loader for TEDX substance datasets.

Supports both JSON (from nettoyage.py output) and CSV formats.
Builds lookup structures used by the analysis services.
"""

import csv
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


# ── JSON loader (primary — matches tedx_PROPRE.json format) ──

def load_substances_from_json(json_path: Path) -> list[dict]:
    """Load TEDX substances from a JSON file.

    Expected format: list of objects with keys: cas, names[], risk, effects[]
    This is the format produced by nettoyage.py.
    """
    if not json_path.exists():
        logger.warning("Substance JSON not found at %s", json_path)
        return []

    try:
        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error("Failed to read JSON %s: %s", json_path, e)
        return []

    if not isinstance(data, list):
        logger.error("JSON %s is not a list", json_path)
        return []

    substances = []
    for i, item in enumerate(data):
        cas = str(item.get("cas", "")).strip()
        names = item.get("names", [])
        risk = str(item.get("risk", "medium")).strip().lower()
        effects = item.get("effects", [])

        # Ensure names is a list of lowercase strings
        if isinstance(names, str):
            names = [names]
        names = [n.lower().strip() for n in names if n and str(n).strip()]

        if not names:
            continue

        if risk not in ("high", "medium", "low"):
            risk = "medium"

        # Ensure effects is a list of strings
        if isinstance(effects, str):
            effects = [e.strip() for e in effects.split(",") if e.strip()]

        substances.append({
            "cas": cas,
            "names": names,
            "risk": risk,
            "effects": effects,
        })

    logger.info(
        "Loaded %d substances (%d total synonyms) from %s",
        len(substances),
        sum(len(s["names"]) for s in substances),
        json_path.name,
    )
    return substances


# ── CSV loader (fallback — for legacy or alternative formats) ──

def load_substances_from_csv(csv_path: Path) -> list[dict]:
    """Load TEDX substances from a CSV file.

    Expected columns: cas, name, risk, effects
    Multiple rows with the same CAS number are treated as synonyms.
    """
    if not csv_path.exists():
        logger.warning("Substance CSV not found at %s", csv_path)
        return []

    cas_groups: dict[str, dict] = {}

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        required = {"cas", "name", "risk", "effects"}
        if reader.fieldnames is None or not required.issubset(set(reader.fieldnames)):
            missing = required - set(reader.fieldnames or [])
            logger.error("CSV %s missing columns: %s", csv_path, missing)
            return []

        for row_num, row in enumerate(reader, start=2):
            cas = row["cas"].strip()
            name = row["name"].strip()
            risk = row["risk"].strip().lower()
            effects = [e.strip() for e in row["effects"].split(",") if e.strip()]

            if not cas or not name:
                continue

            if risk not in ("high", "medium", "low"):
                risk = "medium"

            if cas in cas_groups:
                cas_groups[cas]["names"].append(name.lower())
            else:
                cas_groups[cas] = {
                    "cas": cas,
                    "names": [name.lower()],
                    "risk": risk,
                    "effects": effects,
                }

    substances = list(cas_groups.values())
    logger.info("Loaded %d substances from CSV %s", len(substances), csv_path.name)
    return substances


# ── Shared lookup builder ──

def build_lookup(substances: list[dict]) -> dict[str, dict]:
    """Build a name → substance lookup dict (lowercase keys)."""
    lookup: dict[str, dict] = {}
    for sub in substances:
        for name in sub["names"]:
            lookup[name.lower()] = sub
    return lookup
