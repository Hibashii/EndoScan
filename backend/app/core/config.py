from pathlib import Path

from pydantic_settings import BaseSettings

# backend/ directory (parent of app/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_TITLE: str = "ThyroGuard API"
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    OPEN_FOOD_FACTS_URL: str = "https://world.openfoodfacts.org/api/v2/product"
    OPEN_BEAUTY_FACTS_URL: str = "https://world.openbeautyfacts.org/api/v2/product"

    # Path to the TEDX substances CSV file.
    # Default: backend/data/tedx_substances.csv
    # Override via .env or environment variable to point to cleaned team data.
    TEDX_CSV_PATH: Path = _BACKEND_DIR / "data" / "tedx_substances.csv"

    class Config:
        env_file = ".env"


settings = Settings()
