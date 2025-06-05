from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import telegram, pushinpay, dashboard
import logging
from utils.config import settings

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Criar instância do FastAPI
app = FastAPI(
    title="BlackinBot API",
    description="Sistema comercial de bots pagos para Telegram",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(
    telegram.router,
    prefix="/telegram",
    tags=["Telegram Webhooks"]
)

app.include_router(
    pushinpay.router,
    prefix="/pushinpay",
    tags=["PushinPay Webhooks"]
)

app.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# Endpoints de saúde
@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "BlackinBot API está funcionando!",
        "version": "1.0.0",
        "environment": settings.environment
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde do serviço"""
    return {
        "status": "ok",
        "message": "Serviço funcionando normalmente"
    }

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Evento executado na inicialização"""
    logger.info("🚀 BlackinBot API iniciada!")
    logger.info(f"Ambiente: {settings.environment}")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento executado no encerramento"""
    logger.info("🛑 BlackinBot API encerrada!")

# Handler para erros não tratados
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global para exceções"""
    logger.error(f"Erro não tratado: {str(exc)}")
    return {"detail": "Erro interno do servidor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    ) 