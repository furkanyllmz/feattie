"""Embedding providers."""
from .base import EmbeddingProvider
from .openai_embeddings import OpenAIEmbeddings
from .local_embeddings import LocalEmbeddings


def get_embedding_provider(provider: str, **kwargs) -> EmbeddingProvider:
    """Factory function to get embedding provider.

    Args:
        provider: "openai" or "local"
        **kwargs: Provider-specific arguments

    Returns:
        EmbeddingProvider instance
    """
    if provider == "openai":
        return OpenAIEmbeddings(**kwargs)
    elif provider == "local":
        return LocalEmbeddings(**kwargs)
    else:
        raise ValueError(f"Unknown provider: {provider}. Choose 'openai' or 'local'")


__all__ = ['EmbeddingProvider', 'OpenAIEmbeddings', 'LocalEmbeddings', 'get_embedding_provider']
