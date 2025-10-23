# 🤖 Feattie - Multi-Tenant AI Chat Assistant Platform

**Embeddable AI-powered chat widgets for e-commerce businesses.** Each tenant gets their own customized AI assistant with product knowledge, semantic search, and branded chat interface.

---

## 📋 Quick Info

| Component | Technology | Port |
|-----------|------------|------|
| Frontend (Admin Panel) | React + TypeScript | 5173 |
| Backend API | ASP.NET Core 9.0 | 5078 |
| RAG Service | Python FastAPI | 8000 |
| Database | PostgreSQL | 5432 |

**Admin Login:**
- Email: `admin@example.com`
- Password: `Admin123!`

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Isolated data per business (tenant)
- Separate RAG configurations
- Custom embeddings per tenant
- Product sync from Shopify

### 🎨 Customizable Widget
- Brand colors (primary & secondary gradient)
- Widget position (4 corners)
- Custom chat title & welcome message
- Auto-open settings
- Widget size (small/medium/large)
- Custom CSS support

### 🔐 Role-Based Access Control
- **Admin Role**: Full access
  - Sync products from Shopify
  - Generate embeddings
  - Create/manage tenants
  - View embed code
  - Customize appearance

- **User Role**: Limited access
  - Customize appearance only
  - No sync/embedding access
  - No embed code access

### 🤖 AI-Powered Chat
- Semantic product search
- Context-aware responses
- Product recommendations with images
- Session management
- Multi-language support

### 📦 Embeddable Widget
- One-line JavaScript integration
- CORS enabled for external domains
- No authentication required
- Customizable per tenant

---

## 🚀 Installation

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+**
- **.NET 9.0 SDK**
- **PostgreSQL 15+**

### 1. Clone Repository

```bash
git clone <repository-url>
cd feattie
```

### 2. Setup Database

```bash
# Option A: Docker
docker run --name feattie-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feattie \
  -p 5432:5432 \
  -d postgres:15

# Option B: Use existing PostgreSQL
# Make sure database 'feattie' exists
```

### 3. Backend API Setup

```bash
cd authentication/SecureAuth.Api

# Install dependencies
dotnet restore

# Update appsettings.json with your settings
# (See Configuration section below)

# Run migrations
dotnet ef database update

# Start API
dotnet run
```

API available at: `http://localhost:5078`

### 4. Python RAG Service Setup

```bash
# From project root
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start RAG service
export PYTHONPATH=$PWD  # macOS/Linux
# Windows: set PYTHONPATH=%CD%
python src/api/tenant_server.py
```

RAG service available at: `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5078" > .env

# Start development server
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## ⚙️ Configuration

### Backend API (`authentication/SecureAuth.Api/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=feattie;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters-required",
    "Issuer": "SecureAuth.Api",
    "Audience": "SecureAuth.Client",
    "ExpiryMinutes": 60
  },
  "Cors": {
    "AllowedOrigin": "http://localhost:5173"
  },
  "PythonRAG": {
    "BaseUrl": "http://localhost:8000"
  },
  "OpenAI": {
    "ApiKey": "sk-your-openai-api-key-here"
  }
}
```

### Frontend (`.env` in `frontend/` folder)

```env
VITE_API_URL=http://localhost:5078
```

---

## 📖 Usage Guide

### 1. Login

1. Go to `http://localhost:5173/login`
2. Login with:
   - Email: `admin@example.com`
   - Password: `Admin123!`

### 2. Create a Tenant

1. Navigate to **Tenant Yönetimi**
2. Click **+ Yeni Tenant**
3. Fill in:
   - **Name**: Your business name (e.g., "My Store")
   - **Slug**: Auto-generated from name
   - **Shopify Store URL**: Your Shopify store URL
   - **Shopify Access Token**: (Optional for now)
   - **Max Products**: Default 10000
4. Click **Oluştur**

### 3. Sync Products

1. Find your tenant in the list
2. Click **🔄 Sync Products**
3. Wait for sync to complete
4. Products will appear in stats

### 4. Generate Embeddings

1. After products sync, click **⚡ Generate Embeddings**
2. This creates vector embeddings for semantic search
3. May take a few minutes for large catalogs

### 5. Customize Widget Appearance

1. Click **⚙️ Ayarlar** (Settings) button
2. In **🎨 Görünüm** tab, customize:
   - **Brand Colors**: Primary & secondary (gradient)
   - **Widget Position**: bottom-right, bottom-left, top-right, top-left
   - **Chat Title**: e.g., "Ürün Asistanı"
   - **Welcome Message**: Greeting message
   - **Widget Size**: small, medium, large
   - **Language**: tr, en, etc.
   - **Auto-open**: Enable/disable auto-open
   - **Typing Indicator**: Show "Düşünüyorum..." message
   - **Custom CSS**: Advanced styling
3. Click **Kaydet**

### 6. Get Embed Code (Admin Only)

1. In tenant settings, switch to **📜 Embed Kodu** tab
2. Copy the provided embed code
3. Paste into customer website before `</body>` tag

Example:
```html
<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantSlug: 'my-store',
    apiUrl: 'http://localhost:5078'
  };
</script>
<script src="http://localhost:5078/widget/widget.js"></script>
```

### 7. Test Chat

1. Go to **Chat Test** page
2. Select your tenant
3. Start chatting!

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│         Customer Website                     │
│  ┌────────────────────────────────────┐     │
│  │  Embedded Chat Widget (JS)         │     │
│  │  Loads tenant config via API       │     │
│  └──────────────┬─────────────────────┘     │
└─────────────────┼──────────────────────────┘
                  │ HTTPS
                  ▼
┌──────────────────────────────────────────────┐
│   .NET Core API (Port 5078)                  │
│  ┌────────────────────────────────────┐     │
│  │  Public Endpoints (No Auth):       │     │
│  │  - /api/widget/config/{slug}       │     │
│  │  - /api/chat/{tenantId}            │     │
│  │                                     │     │
│  │  Auth Endpoints:                   │     │
│  │  - /api/tenants/{id}/settings      │     │
│  │  - /api/tenant                     │     │
│  └────────────────────────────────────┘     │
└─────────────┬──────────────┬─────────────────┘
              │              │
              ▼              ▼
  ┌────────────────┐  ┌──────────────────┐
  │  PostgreSQL    │  │  Python RAG      │
  │  Database      │  │  Service         │
  │                │  │  (Port 8000)     │
  │  - Tenants     │  │  - Embeddings    │
  │  - Products    │  │  - LLM Chat      │
  │  - Settings    │  │  - Search        │
  │  - Sessions    │  └──────────────────┘
  └────────────────┘
```

---

## 📡 API Endpoints

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widget/config/{tenantSlug}` | Get widget configuration |
| POST | `/api/chat/{tenantId}` | Send chat message |
| GET | `/api/chat/{tenantId}/history/{sessionId}` | Get chat history |
| GET | `/widget/widget.js` | Widget JavaScript file |

### Authenticated Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

#### Tenant Management (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant` | List tenants |
| POST | `/api/tenant` | Create tenant |
| PUT | `/api/tenant/{id}` | Update tenant |
| POST | `/api/tenant/{id}/sync-products` | Sync from Shopify |
| POST | `/api/tenant/{id}/generate-embeddings` | Generate embeddings |

#### Settings (User & Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants/{id}/settings` | Get settings |
| PUT | `/api/tenants/{id}/settings` | Update settings |
| GET | `/api/tenants/{id}/settings/embed-code` | Get embed code (Admin) |

---

## 🗂️ Project Structure

```
feattie/
├── authentication/SecureAuth.Api/     # .NET Core API
│   ├── Controllers/                   # API endpoints
│   │   ├── AuthController.cs         # Authentication
│   │   ├── TenantController.cs       # Tenant CRUD
│   │   ├── TenantSettingsController.cs # Settings
│   │   └── ChatController.cs         # Chat API
│   ├── Models/                        # Database models
│   │   ├── User.cs
│   │   ├── Tenant.cs
│   │   ├── TenantSettings.cs
│   │   ├── Product.cs
│   │   └── ChatSession.cs
│   ├── Services/                      # Business logic
│   │   ├── ShopifyService.cs
│   │   ├── PythonRAGService.cs
│   │   └── ProductService.cs
│   ├── Data/                          # EF Core
│   │   └── AppDbContext.cs
│   ├── DTOs/                          # Data Transfer Objects
│   ├── Migrations/                    # Database migrations
│   ├── wwwroot/widget/               # Static files
│   │   └── widget.js                 # Embeddable widget
│   ├── Program.cs                     # App entry point
│   └── appsettings.json              # Configuration
├── frontend/                          # React Admin Panel
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── TenantsPage.tsx
│   │   │   ├── TenantSettingsPage.tsx
│   │   │   └── ChatTestPage.tsx
│   │   └── services/
│   │       └── api.ts                # API client
│   └── package.json
├── src/                               # Python RAG Service
│   ├── api/
│   │   └── tenant_server.py          # FastAPI server
│   ├── embeddings/                    # Embedding providers
│   ├── models/                        # ML models
│   └── services/                      # LLM integrations
├── scripts/                           # Utility scripts
│   └── shop_pull.py                  # Shopify scraper
├── requirements.txt                   # Python dependencies
└── README.md                          # This file
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes
lsof -ti:5078 | xargs kill -9  # .NET API
lsof -ti:8000 | xargs kill -9  # Python RAG
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Database Connection Failed

1. Verify PostgreSQL is running: `pg_isready`
2. Check connection string in `appsettings.json`
3. Ensure database `feattie` exists

### Python Module Not Found

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Set PYTHONPATH
export PYTHONPATH=$PWD    # macOS/Linux
set PYTHONPATH=%CD%       # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Migrations Error

```bash
cd authentication/SecureAuth.Api

# Reset database (WARNING: deletes all data)
dotnet ef database drop --force
dotnet ef database update
```

### Chat Not Working

1. Check all 3 services are running (API, RAG, Frontend)
2. Verify tenant has products synced
3. Verify embeddings are generated
4. Check browser console for errors

---

## 🔒 Security Notes

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS
- [ ] Store API keys in environment variables
- [ ] Set `AllowedDomains` in tenant settings
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Update dependencies regularly

### Required API Keys

1. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Used for embeddings & LLM
   - Set in `appsettings.json` or `OPENAI_API_KEY` env var

2. **Shopify Access Token** (per tenant)
   - Create private app in Shopify admin
   - Required permissions: `read_products`

---

## 📝 Test Users

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@example.com | Admin123! | Admin | Full |
| admin@test.com | Test123! | Admin | Full |
| john@test.com | Test123! | User | Limited |
| jane@test.com | Test123! | User | Limited |

---

## 🚀 Deployment

### Environment Variables

```bash
# .NET API
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default="Host=prod-db;Database=feattie;..."
Jwt__Secret="production-secret-key-very-secure"
OpenAI__ApiKey="sk-..."
Cors__AllowedOrigin="https://admin.yourdomain.com"

# Python RAG
PYTHONPATH=/app
OPENAI_API_KEY="sk-..."

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Production URLs

After deployment, update embed code to use production URLs:

```html
<script>
  window.FeattieChat = {
    tenantSlug: 'your-tenant',
    apiUrl: 'https://api.yourdomain.com'
  };
</script>
<script src="https://api.yourdomain.com/widget/widget.js"></script>
```

---

## 📄 License

MIT License

---

## 🙏 Support

For issues and questions:
- GitHub Issues: [Your Repo]
- Email: [Your Email]

---

**Made with ❤️ for modern e-commerce**
