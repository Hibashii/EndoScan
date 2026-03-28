# Entry point for: uvicorn main:app --reload
# Preferred: uvicorn app.main:app --reload

from app.main import app  # noqa: F401
