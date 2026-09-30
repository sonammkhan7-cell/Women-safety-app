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
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
if not allowed_origins or "*" in allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
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
