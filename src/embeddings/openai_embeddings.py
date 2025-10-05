"""OpenAI embedding provider."""
import os
from typing import List
import numpy as np
from openai import OpenAI

from .base import EmbeddingProvider


class OpenAIEmbeddings(EmbeddingProvider):
    """OpenAI embedding provider."""

    DIMENSIONS = {
        'text-embedding-3-large': 3072,
        'text-embedding-3-small': 1536,
        'text-embedding-ada-002': 1536,
    }

    def __init__(self, model: str = "text-embedding-3-large", api_key: str = None):
        """Initialize OpenAI embeddings.

        Args:
            model: OpenAI embedding model name
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self._model_name = model
        self.client = OpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))

    def embed_texts(self, texts: List[str], batch_size: int = 100) -> List[np.ndarray]:
        """Create embeddings for multiple texts."""
        embeddings = []

        print(f"[INFO] Creating OpenAI embeddings for {len(texts)} texts...")

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            response = self.client.embeddings.create(
                model=self._model_name,
                input=batch
            )

            batch_embeddings = [np.array(item.embedding) for item in response.data]
            embeddings.extend(batch_embeddings)

            print(f"[INFO] Embedded {min(i + batch_size, len(texts))}/{len(texts)} texts")

        return embeddings

    def embed_query(self, query: str) -> np.ndarray:
        """Create embedding for a single query."""
        response = self.client.embeddings.create(
            model=self._model_name,
            input=query
        )
        return np.array(response.data[0].embedding)

    @property
    def dimension(self) -> int:
        """Get embedding dimension."""
        return self.DIMENSIONS.get(self._model_name, 1536)

    @property
    def model_name(self) -> str:
        """Get model name."""
        return self._model_name
