"""Local embedding provider using sentence-transformers."""
from typing import List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

from .base import EmbeddingProvider


class LocalEmbeddings(EmbeddingProvider):
    """Local embedding provider using sentence-transformers."""

    def __init__(self, model: str = "intfloat/multilingual-e5-large", device: str = "cpu"):
        """Initialize local embeddings.

        Args:
            model: Sentence transformer model name
            device: Device to use ('cpu' or 'cuda')
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError(
                "sentence-transformers is required for local embeddings. "
                "Install it with: pip install sentence-transformers"
            )

        print(f"[INFO] Loading local embedding model: {model}")
        self._model_name = model
        self.model = SentenceTransformer(model, device=device)
        self._dimension = self.model.get_sentence_embedding_dimension()

    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[np.ndarray]:
        """Create embeddings for multiple texts."""
        print(f"[INFO] Creating local embeddings for {len(texts)} texts...")

        # Add prefix for E5 models
        if "e5" in self._model_name.lower():
            texts = [f"passage: {text}" for text in texts]
            print(f"[INFO] Using E5 model - adding 'passage:' prefix")

        # Encode all texts
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return [emb for emb in embeddings]

    def embed_query(self, query: str) -> np.ndarray:
        """Create embedding for a single query."""
        # Add prefix for E5 models
        query_text = query
        if "e5" in self._model_name.lower():
            query_text = f"query: {query}"

        return self.model.encode(
            query_text,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

    @property
    def dimension(self) -> int:
        """Get embedding dimension."""
        return self._dimension

    @property
    def model_name(self) -> str:
        """Get model name."""
        return self._model_name
