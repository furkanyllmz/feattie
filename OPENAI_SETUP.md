# OpenAI API Key Setup Guide for Feattie

Bu rehber, Feattie projesinde OpenAI API anahtarını nasıl yapılandıracağınızı açıklar.

## 🔧 Kurulum Adımları

### 1. OpenAI API Anahtarı Alın
1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. Hesabınızla giriş yapın
3. "Create new secret key" butonuna tıklayın
4. API anahtarınızı kopyalayın (sk- ile başlar)

### 2. Environment Variable Ayarlayın

#### macOS/Linux:
```bash
# Geçici olarak (sadece bu terminal oturumu için)
export OPENAI_API_KEY='your-api-key-here'

# Kalıcı olarak (~/.zshrc dosyasına ekleyin)
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell):
```powershell
# Geçici olarak
$env:OPENAI_API_KEY="your-api-key-here"

# Kalıcı olarak
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "your-api-key-here", "User")
```

### 3. Servisleri Başlatın

#### Python RAG Servisi:
```bash
# Project root directory'ye gidin
cd feattie
python -m src.api.tenant_server
```

#### .NET API Servisi:
```bash
# Project root directory'den
cd authentication/SecureAuth.Api
dotnet run
```

### 4. Kurulumu Test Edin
```bash
# Project root directory'den
python test_openai_setup.py
```

## 🚀 Kullanım

### RAG Konfigürasyonu Oluşturma

1. **Tenant oluşturun** (eğer yoksa):
```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Mağaza",
    "slug": "test-magaza",
    "shopifyStoreUrl": "https://test-shop.myshopify.com"
  }'
```

2. **RAG konfigürasyonu oluşturun**:
```bash
curl -X POST http://localhost:5000/api/tenants/1/rag-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "embeddingProvider": "OPENAI",
    "llmProvider": "OPENAI",
    "openAIApiKey": "your-api-key-here",
    "llmApiKey": "your-api-key-here"
  }'
```

### Chat Widget Testi

```bash
curl -X POST http://localhost:5000/api/chat/1 \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Merhaba, hangi ürünleriniz var?",
    "sessionId": "test-session-123"
  }'
```

## 🔍 Sorun Giderme

### Yaygın Hatalar:

1. **"OpenAI API key required" hatası**:
   - Environment variable'ın doğru ayarlandığından emin olun
   - `echo $OPENAI_API_KEY` komutu ile kontrol edin

2. **"Python RAG service is not running" hatası**:
   - Python servisinin çalıştığından emin olun
   - Port 8000'in kullanımda olmadığını kontrol edin

3. **"RAG configuration not found" hatası**:
   - Önce tenant oluşturun
   - Sonra RAG konfigürasyonu oluşturun

### Log Kontrolü:

```bash
# .NET API logları
cd authentication/SecureAuth.Api
dotnet run --verbosity detailed

# Python RAG servisi logları
python -m src.api.tenant_server --log-level debug
```

## 📝 Notlar

- API anahtarınızı asla kod içinde hardcode etmeyin
- Production ortamında environment variable kullanın
- API anahtarınızı güvenli tutun ve paylaşmayın
- Rate limit'leri kontrol edin

## 🆘 Yardım

Sorun yaşıyorsanız:
1. `test_openai_setup.py` scriptini çalıştırın
2. Log dosyalarını kontrol edin
3. Environment variable'ları doğrulayın
4. Servislerin çalıştığından emin olun
