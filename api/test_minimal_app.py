"""Minimal FastAPI app for testing"""
from fastapi import FastAPI

app = FastAPI(title="Test API", debug=True)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/test")
def test():
    return {"message": "test works"}
