from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import uvicorn
import logging
import socket

from supabase import create_client

from config import load_config
from routes.user_routes import user_router
from routes.vcs_routes import vcs_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(asctime)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing application state...")

    config = load_config()
    supabase = create_client(config.supabase_url, config.supabase_key)

    app.state.config = config
    app.state.supabase_client = supabase

    yield

    logger.info("Shutting down application...")


app = FastAPI(lifespan=lifespan)

logger.info("Setting up CORS middleware")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(vcs_router)


@app.get("/health", tags=['health'])
def health():
    logger.info("Health check endpoint called")
    return JSONResponse({"message": "healthy!"})


if __name__ == '__main__':
    logger.info("Starting FastAPI server...")

    sck = socket.socket()
    sck.bind(("127.0.0.1", 0)) 

    host, port = sck.getsockname()
    url = f"http://{host}:{port}"

    logger.info(f"FastAPI server is starting at: {url}")

    config = uvicorn.Config(app=app, log_level="info")
    server = uvicorn.Server(config)

    server.run(sockets=[sck])