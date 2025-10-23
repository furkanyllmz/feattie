# 🚀 Feattie - Hızlı Başlangıç Rehberi

## 📌 Admin Girişi

**Email:** `admin@example.com`
**Şifre:** `Admin123!`

**Alternatif Admin:**
- Email: `admin@test.com`
- Şifre: `Test123!`

**Test Kullanıcı (Sınırlı Erişim):**
- Email: `john@test.com`
- Şifre: `Test123!`

---

## 🏃 Servisleri Başlatma

### 1. Python RAG Servisi (Port 8000)

```bash
# Terminal 1 - Project root'dan çalıştırın
cd feattie

# Virtual environment aktif et
source venv/bin/activate  # macOS/Linux
# VEYA
venv\Scripts\activate     # Windows

# PYTHONPATH ayarla
export PYTHONPATH=$PWD    # macOS/Linux
# VEYA
set PYTHONPATH=%CD%       # Windows

# Servisi başlat
python src/api/tenant_server.py
```

**✅ Başarılı:** `INFO: Uvicorn running on http://0.0.0.0:8000`

### 2. .NET API Servisi (Port 5078)

```bash
# Terminal 2 - API klasöründen çalıştırın
cd feattie/authentication/SecureAuth.Api

# Servisi başlat
dotnet run
```

**✅ Başarılı:** `Now listening on: http://localhost:5078`

### 3. React Frontend (Port 5173)

```bash
# Terminal 3 - Frontend klasöründen çalıştırın
cd feattie/frontend

# Servisi başlat
npm run dev
```

**✅ Başarılı:** `➜  Local:   http://localhost:5173/`

---

## 🎯 İlk Kullanım Adımları

### 1. Admin Paneline Giriş

1. Tarayıcıda: `http://localhost:5173/login`
2. Email: `admin@example.com`
3. Şifre: `Admin123!`
4. **Giriş Yap** butonuna tıkla

### 2. Yeni Tenant Oluştur

1. Sol menüden **Tenant Yönetimi**'ne tıkla
2. **+ Yeni Tenant** butonuna tıkla
3. Bilgileri doldur:
   ```
   İsim: Benim Mağazam
   Shopify Store URL: https://mystore.myshopify.com
   Max Products: 10000
   ```
4. **Oluştur** butonuna tıkla

### 3. Ürünleri Senkronize Et

1. Tenant kartında **🔄 Sync Products** butonuna tıkla
2. Senkronizasyon tamamlanana kadar bekle
3. Ürün sayısı kartın üstünde görünecek

### 4. Embedding Oluştur

1. Tenant kartında **⚡ Generate Embeddings** butonuna tıkla
2. İşlem tamamlanana kadar bekle (büyük kataloglar için birkaç dakika sürebilir)
3. Embedding sayısı kartın üstünde görünecek

### 5. Chat Widget'ı Özelleştir

1. Tenant kartında **⚙️ Ayarlar** butonuna tıkla
2. **🎨 Görünüm** sekmesinde:
   - **Renk 1 & 2**: Gradient renklerini seç
   - **Widget Konumu**: Sağ alt, sol alt, vb.
   - **Chat Başlığı**: "Ürün Asistanı"
   - **Hoş Geldin Mesajı**: Özel mesajınızı yazın
3. **Kaydet** butonuna tıkla

### 6. Embed Kodu Al (Sadece Admin)

1. **📜 Embed Kodu** sekmesine geç
2. Gösterilen kodu kopyala
3. Müşteri sitenizin `</body>` taginden önce yapıştır

```html
<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantSlug: 'benim-magazam',
    apiUrl: 'http://localhost:5078'
  };
</script>
<script src="http://localhost:5078/widget/widget.js"></script>
```

### 7. Chat'i Test Et

1. Sol menüden **Chat Test**'e tıkla
2. Dropdown'dan tenant'ınızı seç
3. Mesaj yaz ve test et!

---

## 🐛 Sık Karşılaşılan Sorunlar

### Port Zaten Kullanılıyor

```bash
# Port 5078 (API)
lsof -ti:5078 | xargs kill -9

# Port 8000 (RAG)
lsof -ti:8000 | xargs kill -9

# Port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9
```

### Python Modül Hatası

```bash
# Virtual environment aktif mi kontrol et
which python  # /path/to/feattie/venv/bin/python olmalı

# Değilse aktif et
source venv/bin/activate

# PYTHONPATH ayarla
export PYTHONPATH=$PWD
```

### Database Bağlantı Hatası

```bash
# PostgreSQL çalışıyor mu?
pg_isready

# Database var mı?
psql -U postgres -l | grep feattie

# Yoksa oluştur
createdb -U postgres feattie

# Migration çalıştır
cd authentication/SecureAuth.Api
dotnet ef database update
```

### Admin Olarak Giriş Yapamıyorum

**Sorun giderildi!** API artık camelCase JSON kullanıyor (`role` yerine `Role`).

Eğer hala sorun yaşıyorsanız:

1. Frontend sayfasını yenileyin (Ctrl+F5 veya Cmd+Shift+R)
2. Browser cache'i temizleyin
3. API'nin port 5078'de çalıştığından emin olun

Database'de admin kullanıcıları zaten doğru yapılandırılmış (Role=1 = ADMIN).

### Chat Çalışmıyor

**Kontrol Listesi:**
- [ ] 3 servis de çalışıyor mu? (API, RAG, Frontend)
- [ ] Tenant oluşturuldu mu?
- [ ] Ürünler senkronize edildi mi?
- [ ] Embedding'ler oluşturuldu mu?
- [ ] Browser console'da hata var mı?

---

## 🔑 Test Kullanıcıları

| Email | Şifre | Rol | Erişim |
|-------|-------|-----|--------|
| admin@example.com | Admin123! | Admin | Tam Erişim |
| admin@test.com | Test123! | Admin | Tam Erişim |
| john@test.com | Test123! | User | Sadece Görünüm Ayarları |
| jane@test.com | Test123! | User | Sadece Görünüm Ayarları |

---

## 📊 Port Listesi

| Servis | Port | URL |
|--------|------|-----|
| React Frontend | 5173 | http://localhost:5173 |
| .NET API | 5078 | http://localhost:5078 |
| Python RAG | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🆘 Yardım

Sorun yaşıyorsanız:

1. **Logları kontrol edin:**
   - API: Terminal 2'deki çıktı
   - RAG: Terminal 1'deki çıktı
   - Frontend: Browser console (F12)

2. **Servisleri yeniden başlatın:**
   ```bash
   # Her terminalde Ctrl+C ile durdurun
   # Sonra yukarıdaki komutlarla tekrar başlatın
   ```

3. **Database'i sıfırlayın (son çare):**
   ```bash
   cd authentication/SecureAuth.Api
   dotnet ef database drop --force
   dotnet ef database update
   ```

---

## 🎉 Başarılı Kurulum!

Tüm adımları tamamladıysanız:
- ✅ Admin paneline giriş yapabiliyorsunuz
- ✅ Tenant oluşturabiliyorsunuz
- ✅ Chat test edebiliyorsunuz
- ✅ Widget özelleştirebiliyorsunuz

**Sonraki adımlar:**
- Production deployment için [README.md](README.md) dosyasına bakın
- OpenAI API key ayarları için [OPENAI_SETUP.md](OPENAI_SETUP.md) dosyasına bakın

---

**Made with ❤️ for modern e-commerce**
