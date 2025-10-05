"""LLM Assistant for product recommendations."""
from __future__ import annotations

import json
from typing import List, Dict, Any

from openai import OpenAI
from dotenv import load_dotenv

from src.rag_engine import ProductRAG

# Load environment variables
load_dotenv()


class ProductAssistant:
    """Product recommendation assistant using GPT-4 and RAG."""

    SYSTEM_PROMPT = """Sen bir e-ticaret alışveriş danışmanısın. Müşterilere ürün önerileri sunuyorsun.

Görevin:
- Müşterinin ihtiyaçlarını anlamak ve en uygun ürünleri önermek
- Ürün özellikleri, fiyat, renk, beden gibi detayları açıklamak
- Profesyonel, yardımsever ve samimi bir dille iletişim kurmak
- Sadece sana verilen ürünler hakkında konuşmak (verilen ürünler dışında öneri yapma)

Kurallar:
1. Müşterinin sorusunu dikkatlice analiz et
2. Sana verilen top-3 üründen en uygun olanları öner
3. Ürün başlığı, fiyat, renk, beden gibi özellikleri belirt
4. Eğer hiçbir ürün müşterinin isteğine uymuyorsa, kibarca belirt
5. Fiyatları "TL" olarak göster
6. Türkçe ve doğal bir dille cevap ver

Format:
- Kısa ve öz cevaplar ver
- Emoji kullanma (profesyonel ol)
- Ürün önerirken özelliklerini vurgula
"""

    def __init__(self, rag: ProductRAG, model: str = "gpt-4o-mini"):
        """Initialize the assistant.

        Args:
            rag: ProductRAG instance for search
            model: OpenAI model to use (default: gpt-4o-mini)
        """
        self.rag = rag
        self.client = OpenAI()
        self.model = model

    def _format_product_context(self, results: List[Dict[str, Any]]) -> str:
        """Format search results into context for LLM."""
        if not results:
            return "Hiç ürün bulunamadı."

        context_parts = []
        for i, result in enumerate(results, 1):
            p = result["product"]

            # Format product info
            product_info = [
                f"Ürün {i}:",
                f"  Başlık: {p['title']}",
                f"  Marka: {p['vendor']}",
                f"  Kategori: {p['product_type']}",
                f"  Fiyat: {p['price']} TL",
            ]

            if p.get('colors'):
                product_info.append(f"  Renkler: {', '.join(p['colors'])}")

            if p.get('sizes'):
                product_info.append(f"  Bedenler: {', '.join(p['sizes'])}")

            # Add description from text field
            text = p.get('text', '')
            if 'Tags:' in text:
                parts = text.split('Tags:')
                if len(parts) > 1 and len(parts[1]) > 50:
                    desc = parts[1].split('.', 1)
                    if len(desc) > 1:
                        description = desc[1].strip()
                        if description:
                            product_info.append(f"  Açıklama: {description[:300]}")

            product_info.append(f"  Eşleşme Skoru: {result['similarity']:.2f}")
            context_parts.append("\n".join(product_info))

        return "\n\n".join(context_parts)

    def ask(self, query: str, top_k: int = 3) -> str:
        """Ask the assistant a question and get product recommendations.

        Args:
            query: User's question
            top_k: Number of products to consider

        Returns:
            Assistant's response
        """
        # Search for relevant products
        results = self.rag.search(query, top_k=top_k, deduplicate=True)

        # Format context
        context = self._format_product_context(results)

        # Create user message
        user_message = f"""Müşteri Sorusu: {query}

Bulunan Ürünler:
{context}

Lütfen müşteriye yukarıdaki ürünlere göre yardımcı ol ve uygun önerilerde bulun."""

        # Get LLM response
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content
