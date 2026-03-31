from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import logging

from routes.user_routes import user_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(asctime)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)


app = FastAPI()

logger.info("Setting up CORS middleware")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)

@app.get("/health", tags=['health'])
def health():
    logger.info("Health check endpoint called")
    return JSONResponse({"message": "healthy!"})


if __name__ == '__main__':
    logger.info("Starting FastAPI server on http://localhost:8000")
    uvicorn.run(app, host='0.0.0.0', port=8000)