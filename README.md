# 🛍️ Shopify RAG Product Search & Recommendation System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Enterprise-grade AI-powered product search and recommendation system using **RAG (Retrieval-Augmented Generation)** with flexible embedding providers and GPT-4 integration.

## ✨ Key Features

- 🔍 **Semantic Search**: Natural language product search in 100+ languages (Turkish, English, etc.)
- 🤖 **AI Assistant**: GPT-4 powered product recommendations with context awareness
- ⚡ **Flexible Embeddings**: Switch between OpenAI or local (sentence-transformers) embeddings
- 🚀 **High Performance**: In-memory embedding cache, FastAPI async architecture
- 💬 **Embeddable Widget**: One-line JavaScript integration for any website
- 🔧 **Production Ready**: YAML config, Docker support, comprehensive error handling
- 📊 **Scalable**: Handles 10,000+ products with sub-second response times

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Widget    │─────▶│  FastAPI     │─────▶│  RAG Engine │
│ (Frontend)  │      │   Server     │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐       ┌─────────────┐
                     │   Assistant  │       │  Embeddings │
                     │   (GPT-4)    │       │  (Flexible) │
                     └──────────────┘       └─────────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ▼                             ▼
                             ┌─────────────┐            ┌────────────────┐
                             │   OpenAI    │            │  Sentence-     │
                             │  Embeddings │            │  Transformers  │
                             └─────────────┘            └────────────────┘
```

## 📁 Project Structure

```
feattie/
├── src/                          # Source code
│   ├── embeddings/               # Embedding providers
│   │   ├── base.py              # Abstract interface
│   │   ├── openai_embeddings.py # OpenAI provider
│   │   └── local_embeddings.py  # Local provider
│   ├── api/                     # API module
│   │   └── server.py            # FastAPI server
│   ├── rag_engine.py            # RAG search engine
│   └── assistant.py             # LLM assistant
├── config/                       # Configuration
│   ├── config.yaml              # Main config file
│   └── __init__.py              # Config loader
├── static/js/                   # Frontend assets
│   ├── widget.js                # Chat widget
│   └── widget-loader.js         # Widget loader
├── out/                         # Data files
│   ├── products_rag.jsonl       # RAG-optimized data
│   └── products_sot.jsonl       # Source of truth
├── run.py                       # Main entry point
├── shop_pull.py                 # Shopify data scraper
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone/navigate to repository
cd feattie

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt


# Setup environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (if using OpenAI)
```

### 2. Configure

Edit `config/config.yaml`:

```yaml
# Choose embedding provider
embedding:
  provider: "openai"  # or "local"

  openai:
    model: "text-embedding-3-large"

  local:
    model: "intfloat/multilingual-e5-large"
    device: "cpu"  # or "cuda" for GPU
```

### 3. Fetch Products

```bash
python shop_pull.py --base-url https://your-shopify-store.com --outdir ./out
```

### 4. Start Server

```bash
python run.py
```

Server starts at: **http://localhost:8000**

🎉 **Done!** Embeddings are created on first startup (~30-60 seconds) and cached in memory.

---

## 📖 Usage

### REST API

#### Search Products

```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "siyah hoodie playstation",
    "top_k": 3,
    "deduplicate": true
  }'
```

**Response:**
```json
{
  "query": "siyah hoodie playstation",
  "results": [
    {
      "product_id": 7718603915343,
      "title": "HOODIE 501 — Black / XS",
      "vendor": "LES BENJAMINS",
      "price": 4499.0,
      "similarity": 0.625
    }
  ],
  "count": 1
}
```

#### Ask AI Assistant

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "300 TL altında sweatshirt öner",
    "top_k": 3
  }'
```

#### Get Product IDs

```bash
curl -X POST "http://localhost:8000/product-ids" \
  -H "Content-Type: application/json" \
  -d '{"query": "mavi pantolon", "top_k": 5}'
```

#### API Documentation

Interactive docs: **http://localhost:8000/docs**

---

### Python SDK

```python
from src.rag_engine import ProductRAG
from src.assistant import ProductAssistant

# Initialize with OpenAI embeddings
rag = ProductRAG(
    jsonl_path="./out/products_rag.jsonl",
    embedding_provider="openai",
    embedding_model="text-embedding-3-large"
)

# Or use local embeddings (free!)
rag = ProductRAG(
    jsonl_path="./out/products_rag.jsonl",
    embedding_provider="local",
    embedding_model="intfloat/multilingual-e5-large",
    device="cpu"
)

# Create embeddings
rag.create_embeddings()

# Search
results = rag.search("siyah hoodie playstation", top_k=3)
for r in results:
    print(f"{r['product']['title']} - {r['similarity']:.3f}")

# Get IDs
product_ids = rag.get_product_ids("mavi pantolon", top_k=5)

# AI Assistant
assistant = ProductAssistant(rag, model="gpt-4o-mini")
response = assistant.ask("500 TL altında ürün öner")
print(response)
```

---

### Chat Widget Integration

#### One-Line Integration

Add to your website's `<head>` or `<body>`:

```html
<script src="http://localhost:8000/static/js/widget-loader.js"></script>
```

#### Customization

```html
<script>
  window.SHOPIFY_RAG_API_URL = 'https://your-api-server.com';
  window.SHOPIFY_RAG_COLOR = '#FF6B6B';
  window.SHOPIFY_RAG_TITLE = 'Product Assistant';
  window.SHOPIFY_RAG_POSITION = 'bottom-right';
</script>
<script src="https://your-api-server.com/static/js/widget-loader.js"></script>
```

#### Shopify Integration

1. **Online Store** → **Themes** → **Actions** → **Edit code**
2. Open `theme.liquid`
3. Add before `</head>`:
   ```liquid
   <script src="{{ 'https://your-api-server.com/static/js/widget-loader.js' }}"></script>
   ```
4. Save and publish

---

## ⚙️ Configuration

### Embedding Providers

#### OpenAI (Best Quality, Paid)

```yaml
embedding:
  provider: "openai"
  openai:
    model: "text-embedding-3-large"  # Best quality
    # model: "text-embedding-3-small"  # Cheaper alternative
    batch_size: 100
```

**Pros:**
- ✅ Best quality for multilingual search
- ✅ No GPU required
- ✅ Fast API responses

**Cons:**
- ❌ Costs ~$0.52 for initial embedding (12k products)
- ❌ ~$0.0001 per query

#### Local (Free, Private)

```yaml
embedding:
  provider: "local"
  local:
    model: "intfloat/multilingual-e5-large"  # Best quality
    # model: "paraphrase-multilingual-mpnet-base-v2"  # Alternative
    batch_size: 32
    device: "cpu"  # or "cuda"
```

**Pros:**
- ✅ **$0 cost** - completely free!
- ✅ Privacy - data stays local
- ✅ Offline capability

**Cons:**
- ❌ Requires 8GB+ RAM
- ❌ Slower without GPU
- ❌ First-time model download (~2GB)

### Recommended Models

| Provider | Model | Quality | Speed | Cost | Best For |
|----------|-------|---------|-------|------|----------|
| OpenAI | text-embedding-3-large | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | $$ | Production |
| OpenAI | text-embedding-3-small | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | $ | Budget prod |
| Local | intfloat/multilingual-e5-large | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Free | Development |
| Local | paraphrase-multilingual-mpnet-base-v2 | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ | Free | Development |

---

## 💰 Cost Estimation

### OpenAI Embeddings

| Operation | Cost (12k products) |
|-----------|---------------------|
| Initial embedding creation | ~$0.52 |
| Per query embedding | ~$0.0001 |
| GPT-4o-mini response | ~$0.001-0.003 |

**Monthly cost (1000 queries):** ~$3-5

### Local Embeddings

| Operation | Cost |
|-----------|------|
| Everything | **$0** (Free!) |

**Hardware requirements:** 8GB RAM minimum, GPU recommended for >10k products

### 💡 Recommended: Local Embedding + OpenAI LLM

**Best of both worlds:**
- Embedding: Local (free)
- LLM responses: OpenAI ($0.002/query)
- **Total: ~$2/month for 1000 queries**

---

## 🐛 Troubleshooting

### "No module named 'uvicorn'"

```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### "No module named 'sentence_transformers'"

```bash
pip install -r requirements-local.txt
```

### Embeddings taking too long

- Use `text-embedding-3-small` (5x faster)
- Reduce batch size in config
- Use GPU for local embeddings

### Out of memory

- Reduce number of products
- Use smaller embedding model
- Increase server RAM

### Widget not showing

- Check browser console for errors
- Verify API URL is correct
- Check CORS settings in `config/config.yaml`

### Port 8000 already in use

```yaml
# config/config.yaml
api:
  port: 8001
```

---

## 🐳 Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run server
CMD ["python", "run.py"]
```

```bash
# Build
docker build -t shopify-rag .

# Run
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/out:/app/out \
  shopify-rag
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Products indexed | 12,944 |
| Search latency | <100ms |
| Embedding dimension | 3072 (OpenAI large) |
| Memory usage | ~2GB (with embeddings) |
| Throughput | 100+ req/sec |

---

## 🔒 Security

- ✅ API keys stored in `.env` (never commit!)
- ✅ CORS configurable per environment
- ✅ Input validation on all endpoints
- ⚠️ Rate limiting recommended for production

---

## 🛠️ Development

### Local Development Setup

```bash
# Development mode (with auto-reload)
# Edit config/config.yaml:
api:
  reload: true

python run.py
```

### Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/

# Test API manually
python -c "
import requests
resp = requests.get('http://localhost:8000/')
print(resp.json())
"
```

---

## 📚 Advanced Usage

### Custom Embedding Provider

Implement `EmbeddingProvider` interface:

```python
from src.embeddings.base import EmbeddingProvider

class MyCustomEmbeddings(EmbeddingProvider):
    def embed_texts(self, texts, batch_size):
        # Your implementation
        pass

    def embed_query(self, query):
        # Your implementation
        pass
```

### Batch Processing

```python
# Process multiple queries
queries = ["query1", "query2", "query3"]
for q in queries:
    results = rag.search(q, top_k=5)
    print(f"{q}: {len(results)} results")
```

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Embeddings by [OpenAI](https://openai.com/) and [Sentence-Transformers](https://www.sbert.net/)
- Inspired by modern RAG architectures

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/shopify-rag/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/shopify-rag/discussions)
- **Documentation**: This README
- **API Docs**: http://localhost:8000/docs

---

**Made with ❤️ by Feattie**

*Last updated: 2025*
