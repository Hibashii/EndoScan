from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ThyroGuard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "ThyroGuard API is running"}


@app.get("/api/product/{barcode}")
def get_product(barcode: str):
    """
    TODO: Appeler l'API Open Food Facts / Open Beauty Facts
    pour récupérer les ingrédients du produit.
    """
    return {"barcode": barcode, "status": "not_implemented"}


@app.get("/api/analyze/{barcode}")
def analyze_product(barcode: str):
    """
    TODO: Récupérer les ingrédients puis croiser avec TEDX
    pour identifier les perturbateurs endocriniens thyroïdiens.
    """
    return {"barcode": barcode, "status": "not_implemented"}
