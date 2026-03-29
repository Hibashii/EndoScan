from pathlib import Path

from pydantic_settings import BaseSettings

# backend/ directory (two levels up from this file: app/core/config.py → app/ → backend/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_TITLE: str = "ThyroGuard API"
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    OPEN_FOOD_FACTS_URL: str = "https://world.openfoodfacts.org/api/v2/product"
    OPEN_BEAUTY_FACTS_URL: str = "https://world.openbeautyfacts.org/api/v2/product"

    # ── Data file paths (override via .env or env vars) ──────────────────────
    # TEDX substances (used for live ingredient matching)
    TEDX_CSV_PATH: Path = _BACKEND_DIR / "data" / "tedx_substances.csv"

    # Clean product datasets used for dashboard statistics
    PRODUCTS_CSV_PATH: Path = _BACKEND_DIR / "data" / "clean" / "produits_PROPRES.csv"
    FOOD_CSV_PATH:     Path = _BACKEND_DIR / "data" / "clean" / "food_PROPRES.csv"
    TEDX_JSON_PATH:    Path = _BACKEND_DIR / "data" / "clean" / "tedx_PROPRE.json"

    class Config:
        env_file = ".env"


settings = Settings()
