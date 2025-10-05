"""Base embedding provider interface."""
from abc import ABC, abstractmethod
from typing import List
import numpy as np


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""

    @abstractmethod
    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[np.ndarray]:
        """Create embeddings for multiple texts.

        Args:
            texts: List of texts to embed
            batch_size: Batch size for processing

        Returns:
            List of embedding vectors
        """
        pass

    @abstractmethod
    def embed_query(self, query: str) -> np.ndarray:
        """Create embedding for a single query.

        Args:
            query: Query text

        Returns:
            Embedding vector
        """
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Get embedding dimension."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Get model name."""
        pass
