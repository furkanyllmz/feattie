"""FastAPI server for product search and recommendations."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from src.rag_engine import ProductRAG
from src.assistant import ProductAssistant
from config import get_config

# Load environment variables
load_dotenv()

# Load configuration
config = get_config()

# Global variables to store RAG and Assistant
rag: Optional[ProductRAG] = None
assistant: Optional[ProductAssistant] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG and Assistant on startup, keep in memory."""
    global rag, assistant

    print("[INFO] Starting up - Loading RAG system...")

    # Initialize RAG with config
    rag = ProductRAG(
        jsonl_path=config.products_rag_path,
        embedding_provider=config.embedding_provider,
        embedding_model=(
            config.openai_embedding_model
            if config.embedding_provider == "openai"
            else config.local_embedding_model
        )
    )

    print("[INFO] Creating embeddings (one-time operation)...")
    rag.create_embeddings()

    print("[INFO] Initializing LLM Assistant...")
    assistant = ProductAssistant(rag, model=config.llm_model)

    print("[INFO] ✅ Server ready! Embeddings cached in memory.")

    yield

    # Cleanup on shutdown
    print("[INFO] Shutting down...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Shopify RAG Product Search",
    description="Product search and recommendation API using RAG",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
cors_config = config.get('api', 'cors', default={})
if cors_config.get('enabled', True):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_config.get('origins', ["*"]),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Serve static files (widget script)
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except RuntimeError:
    pass  # Directory doesn't exist


# Request/Response models
class SearchRequest(BaseModel):
    query: str
    top_k: int = 3
    deduplicate: bool = True


class ProductResult(BaseModel):
    product_id: int
    variant_id: int
    title: str
    vendor: str
    product_type: str
    price: float
    colors: List[str]
    sizes: List[str]
    similarity: float


class SearchResponse(BaseModel):
    query: str
    results: List[ProductResult]
    count: int


class AskRequest(BaseModel):
    query: str
    top_k: int = 3


class AskResponse(BaseModel):
    query: str
    response: str
    products_considered: int


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "message": "Shopify RAG Product Search API",
        "embedding_provider": config.embedding_provider,
        "endpoints": {
            "search": "/search - Search for products",
            "ask": "/ask - Get AI recommendations",
            "product_ids": "/product-ids - Get product IDs only"
        }
    }


@app.post("/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    """Search for products using RAG."""
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        results = rag.search(
            query=request.query,
            top_k=request.top_k,
            deduplicate=request.deduplicate
        )

        products = [
            ProductResult(
                product_id=r["product"]["product_id"],
                variant_id=r["product"]["variant_id"],
                title=r["product"]["title"],
                vendor=r["product"]["vendor"],
                product_type=r["product"]["product_type"],
                price=r["product"]["price"],
                colors=r["product"]["colors"],
                sizes=r["product"]["sizes"],
                similarity=r["similarity"]
            )
            for r in results
        ]

        return SearchResponse(
            query=request.query,
            results=products,
            count=len(products)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask", response_model=AskResponse)
async def ask_assistant(request: AskRequest):
    """Get AI product recommendations."""
    if assistant is None:
        raise HTTPException(status_code=503, detail="Assistant not initialized")

    try:
        response = assistant.ask(request.query, top_k=request.top_k)

        return AskResponse(
            query=request.query,
            response=response,
            products_considered=request.top_k
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/product-ids")
async def get_product_ids(request: SearchRequest):
    """Get only product IDs from search."""
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        product_ids = rag.get_product_ids(
            query=request.query,
            top_k=request.top_k,
            deduplicate=request.deduplicate
        )

        return {
            "query": request.query,
            "product_ids": product_ids,
            "count": len(product_ids)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.api.server:app",
        host=config.api_host,
        port=config.api_port,
        reload=config.get('api', 'reload', default=False)
    )
