"""CSV data loader for TEDX substance datasets.

Reads substance data from CSV files and builds lookup structures
used by the analysis services. Designed so team members can drop in
cleaned CSV files without touching any Python code.
"""

import csv
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def load_substances_from_csv(csv_path: Path) -> list[dict]:
    """Load TEDX substances from a CSV file.

    Expected columns: cas, name, risk, effects
    Multiple rows with the same CAS number are treated as synonyms.

    Returns a list of substance dicts grouped by CAS:
        [{"cas": "...", "names": [...], "risk": "...", "effects": [...]}, ...]
    """
    if not csv_path.exists():
        logger.warning("Substance CSV not found at %s — returning empty dataset", csv_path)
        return []

    # First pass: group rows by CAS number
    cas_groups: dict[str, dict] = {}

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Validate required columns
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
                logger.warning("Skipping row %d: empty cas or name", row_num)
                continue

            if risk not in ("high", "medium", "low"):
                logger.warning("Row %d: unexpected risk '%s', defaulting to 'medium'", row_num, risk)
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
    logger.info("Loaded %d substances (%d synonyms) from %s",
                len(substances),
                sum(len(s["names"]) for s in substances),
                csv_path.name)
    return substances


def build_lookup(substances: list[dict]) -> dict[str, dict]:
    """Build a name → substance lookup dict (lowercase keys)."""
    lookup: dict[str, dict] = {}
    for sub in substances:
        for name in sub["names"]:
            lookup[name.lower()] = sub
    return lookup
