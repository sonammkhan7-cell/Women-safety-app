from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, location, alerts, routes, chat

# Automatically create sqlite tables on launch (for prototyping / ease of run)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the AI-powered Women Safety Guardian Agent application.",
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount APIRouters
app.include_router(auth.router, prefix="/api")
app.include_router(location.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
