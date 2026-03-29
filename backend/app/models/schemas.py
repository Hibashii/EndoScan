from pydantic import BaseModel


class MatchedIngredient(BaseModel):
    name: str
    risk: str   # "high" | "medium" | "low"
    note: str


class ProductResponse(BaseModel):
    barcode: str
    name: str
    brand: str
    category: str
    source: str  # "food" | "beauty"
    ingredients: list[str]


class AnalyzeResponse(BaseModel):
    barcode: str
    name: str
    brand: str
    category: str
    source: str
    ingredients: list[str]
    matched: list[MatchedIngredient]


# ── Dashboard ─────────────────────────────────────────────────────────────────

class TopSubstance(BaseModel):
    name: str
    pct: float
    risk: str   # "high" | "medium" | "low"


class CategoryStat(BaseModel):
    cat: str
    pct: int
    total: int


class CosmVsFood(BaseModel):
    cosm: int
    food: int


class DashboardStats(BaseModel):
    totalProducts: int
    totalBeauty: int
    totalFood: int
    totalSubstancesTEDX: int
    percentWithPE: float
    topSubstances: list[TopSubstance]
    byCategory: list[CategoryStat]
    cosmVsFood: CosmVsFood


class ErrorResponse(BaseModel):
    detail: str
