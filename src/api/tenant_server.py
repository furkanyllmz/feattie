"""
FastAPI server for multi-tenant RAG system.
This version supports tenant-specific embeddings and search.
"""
from __future__ import annotations

from typing import List, Optional
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from src.embeddings.openai_embeddings import OpenAIEmbeddings
from src.embeddings.local_embeddings import LocalEmbeddings

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Multi-Tenant RAG API",
    description="Tenant-aware embedding generation and search",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class EmbedRequest(BaseModel):
    tenant_id: int
    text: str
    embedding_provider: str = "local"  # "local" or "openai"
    embedding_model: Optional[str] = None
    openai_api_key: Optional[str] = None


class EmbedResponse(BaseModel):
    embedding: List[float]
    dimension: int


class TenantSearchRequest(BaseModel):
    tenant_id: int
    query: str
    top_k: int = 3
    include_contexts: bool = True


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "message": "Multi-Tenant RAG API",
        "version": "1.0.0"
    }


@app.post("/embed", response_model=EmbedResponse)
async def generate_embedding(request: EmbedRequest):
    """Generate embedding for a single text."""
    try:
        # Initialize embedding provider based on config
        if request.embedding_provider.lower() == "openai":
            if not request.openai_api_key:
                raise HTTPException(status_code=400, detail="OpenAI API key required")

            model = request.embedding_model or "text-embedding-3-large"
            embedder = OpenAIEmbeddings(
                api_key=request.openai_api_key,
                model=model
            )
        else:
            # Local embeddings
            model = request.embedding_model or "intfloat/multilingual-e5-large"
            embedder = LocalEmbeddings(model=model)

        # Generate embedding
        embedding = embedder.embed_query(request.text)

        return EmbedResponse(
            embedding=embedding.tolist(),
            dimension=embedder.dimension
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def tenant_search(request: TenantSearchRequest):
    """
    Search products for a specific tenant.
    This endpoint will be called by .NET API with tenant-specific product data.
    """
    # TODO: Implement tenant-specific search
    # For now, return a placeholder response
    return {
        "query": request.query,
        "products": [],
        "contexts_used": [],
        "search_time_ms": 0,
        "message": "Tenant search endpoint - implement with database integration"
    }


class ChatRequest(BaseModel):
    tenant_id: int
    query: str
    context: str
    conversation_history: Optional[List[dict]] = None
    system_prompt: Optional[str] = None
    llm_provider: str = "openai"  # "openai" or "local"
    llm_model: Optional[str] = None
    llm_api_key: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 500


class ChatResponse(BaseModel):
    response: str
    tokens_used: Optional[int] = None
    elapsed_ms: float


@app.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """
    Generate AI response using LLM (OpenAI or local).
    """
    import time
    start_time = time.time()

    try:
        if request.llm_provider.lower() == "openai":
            if not request.llm_api_key:
                raise HTTPException(status_code=400, detail="OpenAI API key required")

            from openai import OpenAI
            client = OpenAI(api_key=request.llm_api_key)

            # Build messages
            messages = []

            # System prompt with context
            system_content = request.system_prompt or "Sen yardımcı bir alışveriş asistanısın."
            if request.context:
                system_content += f"\n\nBağlam Bilgileri:\n{request.context}"

            messages.append({"role": "system", "content": system_content})

            # Add conversation history
            if request.conversation_history:
                for msg in request.conversation_history[-6:]:  # Last 3 exchanges
                    role = "user" if msg.get("role") == "USER" else "assistant"
                    messages.append({"role": role, "content": msg.get("content", "")})

            # Add current query
            messages.append({"role": "user", "content": request.query})

            # Call OpenAI
            model = request.llm_model or "gpt-4o-mini"
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )

            elapsed_ms = (time.time() - start_time) * 1000

            return ChatResponse(
                response=response.choices[0].message.content,
                tokens_used=response.usage.total_tokens if response.usage else None,
                elapsed_ms=elapsed_ms
            )
        else:
            # Local LLM (placeholder - you can integrate ollama or other local models)
            raise HTTPException(status_code=501, detail="Local LLM not implemented yet")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
async def tenant_ask(request: dict):
    """
    AI assistant endpoint for tenant-specific queries (legacy).
    Use /chat endpoint instead.
    """
    return {
        "query": request.get("query"),
        "response": "Please use /chat endpoint for chat completions",
        "products_referenced": [],
        "contexts_used": [],
        "session_id": request.get("session_id"),
        "total_time_ms": 0
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.api.tenant_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
