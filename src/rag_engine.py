"""RAG search engine with configurable embedding providers."""
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
from dotenv import load_dotenv

from src.embeddings import get_embedding_provider, EmbeddingProvider

# Load environment variables
load_dotenv()


class ProductRAG:
    """RAG system for product search with flexible embedding providers."""

    def __init__(
        self,
        jsonl_path: str,
        embedding_provider: str = "openai",
        embedding_model: Optional[str] = None,
        **provider_kwargs
    ):
        """Initialize RAG system with product data.

        Args:
            jsonl_path: Path to products_rag.jsonl file
            embedding_provider: "openai" or "local"
            embedding_model: Model name (provider-specific)
            **provider_kwargs: Additional provider arguments (api_key, device, etc.)
        """
        self.jsonl_path = jsonl_path
        self.products: List[Dict[str, Any]] = []
        self.embeddings: List[np.ndarray] = []

        # Initialize embedding provider
        if embedding_model:
            provider_kwargs['model'] = embedding_model

        self.embedding_provider: EmbeddingProvider = get_embedding_provider(
            embedding_provider,
            **provider_kwargs
        )

        print(f"[INFO] Using {embedding_provider} embeddings with model: {self.embedding_provider.model_name}")

        # Load products
        self._load_products(jsonl_path)

    def _load_products(self, jsonl_path: str) -> None:
        """Load products from JSONL file."""
        path = Path(jsonl_path)
        if not path.exists():
            raise FileNotFoundError(f"JSONL file not found: {jsonl_path}")

        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    self.products.append(json.loads(line))

        print(f"[INFO] Loaded {len(self.products)} products")

    def create_embeddings(self, batch_size: Optional[int] = None) -> None:
        """Create embeddings for all products.

        Args:
            batch_size: Batch size for processing (provider-specific default if None)
        """
        print(f"[INFO] Creating embeddings for {len(self.products)} products...")

        texts = [p["text"] for p in self.products]

        # Use provider-specific batch size if not specified
        if batch_size is None:
            # Check class name as string
            provider_class_name = self.embedding_provider.__class__.__name__
            batch_size = 100 if provider_class_name == 'OpenAIEmbeddings' else 32

        self.embeddings = self.embedding_provider.embed_texts(texts, batch_size=batch_size)

        print(f"[INFO] Embeddings created successfully ({self.embedding_provider.dimension} dimensions)")

    def search(self, query: str, top_k: int = 3, deduplicate: bool = True) -> List[Dict[str, Any]]:
        """Search for products using query.

        Args:
            query: Search query text
            top_k: Number of top results to return
            deduplicate: If True, return only unique products (not variants)

        Returns:
            List of top-k most relevant products with similarity scores
        """
        if len(self.embeddings) == 0:
            raise ValueError("No embeddings found. Call create_embeddings() first.")

        # Get query embedding
        query_embedding = self.embedding_provider.embed_query(query)

        # Calculate cosine similarities
        similarities = []
        for product, embedding in zip(self.products, self.embeddings):
            similarity = np.dot(query_embedding, embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
            )
            similarities.append({
                "product": product,
                "similarity": float(similarity)
            })

        # Sort by similarity
        similarities.sort(key=lambda x: x["similarity"], reverse=True)

        # Deduplicate by product_id (keep highest scoring variant)
        if deduplicate:
            seen_products = set()
            unique_results = []
            for result in similarities:
                product_id = result["product"]["product_id"]
                if product_id not in seen_products:
                    seen_products.add(product_id)
                    unique_results.append(result)
                    if len(unique_results) >= top_k:
                        break
            return unique_results

        return similarities[:top_k]

    def get_product_ids(self, query: str, top_k: int = 3, deduplicate: bool = True) -> List[int]:
        """Search and return only product IDs.

        Args:
            query: Search query text
            top_k: Number of top results to return
            deduplicate: If True, return only unique products

        Returns:
            List of top-k unique product IDs
        """
        results = self.search(query, top_k=top_k, deduplicate=deduplicate)
        return [result["product"]["product_id"] for result in results]

    def get_variant_ids(self, query: str, top_k: int = 3) -> List[int]:
        """Search and return only variant IDs (no deduplication).

        Args:
            query: Search query text
            top_k: Number of top results to return

        Returns:
            List of top-k variant IDs
        """
        results = self.search(query, top_k=top_k, deduplicate=False)
        return [result["product"]["variant_id"] for result in results]


def main():
    """Example usage."""
    import argparse

    parser = argparse.ArgumentParser(description="RAG search for Shopify products")
    parser.add_argument(
        "--jsonl",
        default="./out/products_rag.jsonl",
        help="Path to products_rag.jsonl"
    )
    parser.add_argument(
        "--query",
        required=True,
        help="Search query"
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="Number of results to return"
    )
    parser.add_argument(
        "--provider",
        default="openai",
        choices=["openai", "local"],
        help="Embedding provider"
    )
    parser.add_argument(
        "--model",
        help="Embedding model (provider-specific)"
    )
    parser.add_argument(
        "--ids-only",
        action="store_true",
        help="Return only product IDs (comma-separated)"
    )
    parser.add_argument(
        "--no-deduplicate",
        action="store_true",
        help="Don't remove duplicate products (show all variants)"
    )

    args = parser.parse_args()

    # Initialize RAG
    rag = ProductRAG(
        args.jsonl,
        embedding_provider=args.provider,
        embedding_model=args.model
    )

    # Create embeddings
    rag.create_embeddings()

    # Search
    deduplicate = not args.no_deduplicate

    if args.ids_only:
        ids = rag.get_product_ids(args.query, top_k=args.top_k, deduplicate=deduplicate)
        print(",".join(map(str, ids)))
    else:
        results = rag.search(args.query, top_k=args.top_k, deduplicate=deduplicate)
        print("\n[SEARCH RESULTS]")
        for i, result in enumerate(results, 1):
            p = result["product"]
            print(f"\n{i}. {p['title']}")
            print(f"   Product ID: {p['product_id']}")
            print(f"   Variant ID: {p['variant_id']}")
            print(f"   Similarity: {result['similarity']:.3f}")
            print(f"   Price: {p['price']} TL")
            print(f"   Vendor: {p['vendor']}")


if __name__ == "__main__":
    main()
