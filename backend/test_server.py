#!/usr/bin/env python3
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Test Server")

@app.get("/")
def read_root():
    return {"message": "Servidor teste funcionando!", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste na porta 3025...")
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=3025,
        log_level="info"
    ) 