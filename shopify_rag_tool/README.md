# Shopify Ürünleri → RAG & SoT Aracı

Shopify mağazasının public `products.json` uç noktasını sayfalayarak tüm ürünleri çeken ve iki farklı JSONL dosya üreten Python komut satırı aracıdır:

- `products_rag.jsonl`: her varyant için tek satır, gömme/arama (RAG) süreçlerine hazır.
- `products_sot.jsonl`: her ürün için tüm varyantlarıyla bir kaynak-gerçeklik (SoT) kaydı.

> Stok kontrolü veya özel API erişimi yok; yalnızca veriyi çek, normalize et ve diske yaz.

## Gereksinimler

- Python 3.10+
- `requests` kütüphanesi (`requirements.txt` içinde tanımlı)

### Hızlı Kurulum

```powershell
cd shopify_rag_tool
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

## Kullanım

Zorunlu `--base-url` argümanını ve ihtiyaç duyduğunuz opsiyonel bayrakları vererek çalıştırın:

```powershell
cd shopify_rag_tool
python shop_pull.py \
  --base-url https://lesbenjamins.com \
  --outdir ./out \
  --per-page 250 \
  --sleep 0.4
```

### Argümanlar

| Bayrak | Açıklama | Varsayılan |
| --- | --- | --- |
| `--base-url` | Shopify mağaza ana URL’si (**zorunlu**) | – |
| `--outdir` | JSONL dosyalarının yazılacağı klasör | `./out` |
| `--per-page` | Her istekte çekilecek ürün sayısı (`limit`) | `250` |
| `--sleep` | İstekler arası bekleme süresi (saniye) | `0.4` |
| `--max-pages` | Maksimum sayfa sayısı güvenlik sınırı | `2000` |
| `--timeout` | HTTP zaman aşımı (saniye) | `25` |
| `--user-agent` | Özel User-Agent değeri | `ShopifyProductsFetcher/1.0 (+https://github.com/feattie)` |

## Çıktılar

Dosyalar UTF-8 JSONL formatındadır ve `ensure_ascii=False` ile yazılır:

1. **RAG** (`products_rag.jsonl`): Varyant başına bir satır; normalize edilmiş metin alanı (`colors`, `sizes`, satıcı/tür/etiketler, HTML’siz gövde) içerir.
2. **SoT** (`products_sot.jsonl`): Ürün başına bir satır; benzersiz renk/beden listeleri ve eksiksiz varyant dizisi barındırır.

## Hata Yönetimi ve Loglama

- 5xx yanıtlar ve ağ hatalarında 3 denemeli üstel geri çekilme (0.5s, 1s, 2s) uygulanır.
- 200 dışı yanıtlar, JSON parse hataları veya beklenmeyen şemalar stderr’e loglanır ve süreç çıkış kodu `1` ile sonlanır.
- Bilgilendirme logları her sayfada çekilen ürün sayısını ve çıktı dosyalarının yollarını bildirir.

## İpuçları

- Mağaza `max-pages` sınırını aşıyorsa bayrağı yükseltin veya farklı parametrelerle yeniden çalıştırın.
- Araç yalnızca public endpoint’e dokunur; mağazanın kullanım koşulları ve hız limitlerine dikkat edin.
