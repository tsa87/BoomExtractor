import logging
import uvicorn
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.upload import router as upload_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan events
    """
    # Startup
    logger.info("Starting Workflow Generator API")

    yield

    # Shutdown
    logger.info("Shutting down Workflow Generator API")


# Create FastAPI application
app = FastAPI(
    title="Scientific Workflow Generator API",
    description=
    "Generate interactive workflow visualizations from research papers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # Alternative React port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/api", tags=["upload"])


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Scientific Workflow Generator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors
    """
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(status_code=500,
                        content={
                            "error": "Internal server error",
                            "message": "An unexpected error occurred"
                        })


# Development server
if __name__ == "__main__":
    uvicorn.run("app.main:app",
                host="0.0.0.0",
                port=8000,
                reload=True,
                log_level="info")
