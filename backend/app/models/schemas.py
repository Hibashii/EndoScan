from pydantic import BaseModel


class MatchedIngredient(BaseModel):
    name: str
    risk: str  # "high" | "medium" | "low"
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


class ErrorResponse(BaseModel):
    detail: str
