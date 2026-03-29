import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.services import stats_service

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Compute dashboard stats once at startup from the clean CSV/JSON files."""
    logger.info("Starting ThyroGuard API — loading datasets…")
    stats_service.init(
        products_csv=settings.PRODUCTS_CSV_PATH,
        food_csv=settings.FOOD_CSV_PATH,
        tedx_json=settings.TEDX_JSON_PATH,
    )
    logger.info("Datasets loaded. API ready.")
    yield
    # Nothing to clean up


app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "ThyroGuard API is running"}
