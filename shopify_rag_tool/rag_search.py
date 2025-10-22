"""RAG search system for Shopify products using sentence-transformers embeddings."""
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
from sentence_transformers import SentenceTransformer


class ProductRAG:
    """RAG system for product search using sentence-transformers embeddings."""

    def __init__(self, jsonl_path: str, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize RAG system with product data.

        Args:
            jsonl_path: Path to products_rag.jsonl file
            model_name: Sentence transformer model name (default: all-MiniLM-L6-v2)
                       Other options: paraphrase-multilingual-MiniLM-L12-v2 (for Turkish)
        """
        print(f"[INFO] Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)x"
        self.products: List[Dict[str, Any]] = []
        self.embeddings: List[np.ndarray] = []
        self.jsonl_path = jsonl_path

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

    def create_embeddings(self, batch_size: int = 32) -> None:
        """Create embeddings for all products.

        Args:
            batch_size: Number of products to embed in each batch
        """
        print(f"[INFO] Creating embeddings for {len(self.products)} products...")

        texts = [p["text"] for p in self.products]

        # Encode all texts in batches
        self.embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True
        )

        print(f"[INFO] Embeddings created successfully")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search for products using query.

        Args:
            query: Search query text
            top_k: Number of top results to return

        Returns:
            List of top-k most relevant products with similarity scores
        """
        if len(self.embeddings) == 0:
            raise ValueError("No embeddings found. Call create_embeddings() first.")

        # Get query embedding
        query_embedding = self.model.encode(query, convert_to_numpy=True)

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

        # Sort by similarity and return top-k
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return similarities[:top_k]

    def get_product_ids(self, query: str, top_k: int = 3) -> List[int]:
        """Search and return only product IDs.

        Args:
            query: Search query text
            top_k: Number of top results to return

        Returns:
            List of top-k product IDs
        """
        results = self.search(query, top_k=top_k)
        return [result["product"]["product_id"] for result in results]

    def get_variant_ids(self, query: str, top_k: int = 3) -> List[int]:
        """Search and return only variant IDs.

        Args:
            query: Search query text
            top_k: Number of top results to return

        Returns:
            List of top-k variant IDs
        """
        results = self.search(query, top_k=top_k)
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
        "--ids-only",
        action="store_true",
        help="Return only product IDs (comma-separated)"
    )
    parser.add_argument(
        "--variant-ids",
        action="store_true",
        help="Return variant IDs instead of product IDs"
    )
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="Sentence transformer model (default: all-MiniLM-L6-v2, Turkish: paraphrase-multilingual-MiniLM-L12-v2)"
    )

    args = parser.parse_args()

    # Initialize RAG
    rag = ProductRAG(args.jsonl, model_name=args.model)

    # Create embeddings
    rag.create_embeddings()

    # Search
    if args.ids_only:
        if args.variant_ids:
            ids = rag.get_variant_ids(args.query, top_k=args.top_k)
        else:
            ids = rag.get_product_ids(args.query, top_k=args.top_k)
        print(",".join(map(str, ids)))
    else:
        results = rag.search(args.query, top_k=args.top_k)
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
