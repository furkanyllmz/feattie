# 🤖 Feattie - AI-Powered Multi-Tenant E-Commerce Chat Platform

**Embeddable AI chat widgets for e-commerce businesses.** Each tenant gets their own customized AI assistant with product knowledge, semantic search, RAG (Retrieval-Augmented Generation), and fully branded chat interface.

---

## 📋 Quick Info

| Component | Technology | Port | Status |
|-----------|------------|------|--------|
| **Admin Dashboard** | React + Vite + TypeScript + Tailwind + shadcn/ui | 5173 | ✅ |
| **Backend API** | ASP.NET Core 9.0 + Entity Framework Core | 5078 | ✅ |
| **RAG Service** | Python 3.11 + FastAPI + Sentence Transformers | 8000 | ✅ |
| **Database** | PostgreSQL 15+ | 5432 | ✅ |

### 🔑 Default Admin Credentials
- **Email:** `admin@example.com`
- **Password:** `Admin123!`

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+**
- **.NET 9.0 SDK**
- **PostgreSQL 15+**
- **OpenAI API Key** (for embeddings & chat)

### 1️⃣ Clone & Setup Database

```bash
# Clone repository
git clone <your-repo-url>
cd feattie

# Start PostgreSQL with Docker (or use existing instance)
docker run --name feattie-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feattie \
  -p 5432:5432 \
  -d postgres:15
```

### 2️⃣ Start Backend API (.NET)

```bash
cd authentication/SecureAuth.Api

# Restore dependencies
dotnet restore

# Update appsettings.json with your OpenAI API key
# Edit: authentication/SecureAuth.Api/appsettings.json
# Set: "OpenAI": { "ApiKey": "sk-your-key-here" }

# Run migrations
dotnet ef database update

# Start API server
dotnet run
```

✅ **Backend running at:** http://localhost:5078

### 3️⃣ Start RAG Service (Python)

```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start RAG server
export PYTHONPATH=$PWD  # On Windows: set PYTHONPATH=%CD%
python -m uvicorn src.api.tenant_server:app --host 0.0.0.0 --port 8000 --reload
```

✅ **RAG Service running at:** http://localhost:8000

### 4️⃣ Start Admin Dashboard (React)

```bash
cd admin-dashboard

# Install dependencies
npm install

# Create .env file (if not exists)
echo "VITE_API_URL=http://localhost:5078" > .env

# Start development server
npm run dev
```

✅ **Admin Dashboard running at:** http://localhost:5173

### 5️⃣ Login & Create Your First Tenant

1. Open browser: **http://localhost:5173/auth/login**
2. Login with admin credentials (see above)
3. Navigate to **"Tenant Management"**
4. Click **"Create New Tenant"** button
5. Fill in tenant details:
   - **Name:** Your Store Name (e.g., "My Fashion Store")
   - **Slug:** Auto-generated URL slug (e.g., "my-fashion-store")
   - **Shopify Store URL:** https://your-store.myshopify.com
   - **Shopify Access Token:** (Optional - leave empty for now)
   - **Max Products:** 10000 (default)
6. Click **"Create Tenant"**
7. Click **"Sync Products"** to import products from Shopify
8. Click **"Generate Embeddings"** to enable AI semantic search
9. Customize widget appearance in **"Widget Settings"**
10. Get embed code and test in **"Chat Test"**

🎉 **Done!** Your AI chat widget is ready to embed on your e-commerce site.

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Isolated data per business (tenant)**
- Each tenant has separate:
  - Product catalog
  - RAG configuration
  - Embeddings database
  - Chat sessions & history
  - Widget customization
  - User access control

### 🎨 Fully Customizable Widget
- **Brand Colors:** Primary & secondary colors with gradient support
- **Position:** 4 corner positions (bottom-right, bottom-left, top-right, top-left)
- **Chat Title & Welcome Message:** Custom greetings
- **Auto-open Settings:** Delay timer for automatic widget opening
- **Typing Indicator:** Show "AI is thinking..." animation
- **Live Preview:** See changes in real-time before saving
- **Embed Code Generator:** One-click copy embed code

### 🔐 Role-Based Access Control (RBAC)

#### Admin Role (Full Access)
- ✅ Create, update, delete tenants
- ✅ Sync products from Shopify
- ✅ Generate embeddings for semantic search
- ✅ View all tenants and users
- ✅ Assign users to tenants
- ✅ Customize widget appearance
- ✅ Access embed code
- ✅ View system statistics

#### User Role (Limited Access)
- ✅ View assigned tenant(s) only
- ✅ Customize widget appearance for assigned tenant
- ✅ Test chat functionality
- ✅ View tenant statistics
- ❌ Cannot sync products or generate embeddings
- ❌ Cannot access embed code
- ❌ Cannot manage other tenants or users

### 🤖 AI-Powered Chat (RAG)
- **Semantic Product Search:** Find products by meaning, not just keywords
- **Context-Aware Responses:** AI understands conversation history
- **Product Recommendations:** Smart suggestions with images and links
- **Multi-language Support:** Turkish, English, and more
- **Session Management:** Persistent conversations
- **Embeddings:** Sentence Transformers (multilingual-e5-large)
- **LLM:** OpenAI GPT-4o-mini

### 📦 Shopify Integration
- **Automatic Product Sync:** Import products from Shopify store
- **Public & Private API Support:** Works with or without access token
- **Product Data:** Title, description, price, images, variants, handle, vendor
- **Incremental Sync:** Only updates changed products

### 📊 Admin Dashboard
- **System Statistics:** Total users, active users, tenants
- **Tenant Management:** CRUD operations for tenants
- **User Management:** Assign users to tenants with roles
- **Widget Settings:** Live preview and customization
- **Chat Test:** Test AI chat with real products
- **Responsive Design:** Works on desktop, tablet, and mobile

---

## 📖 Detailed Usage Guide

### Creating a Tenant

1. **Navigate to Tenant Management**
   - Click "Tenant Management" in sidebar

2. **Click "Create New Tenant"**
   - Fill in the form:
     - **Tenant Name:** Display name (e.g., "Fashion Boutique")
     - **Slug:** URL-safe identifier (auto-generated, e.g., "fashion-boutique")
     - **Shopify Store URL:** Full URL (e.g., "https://my-store.myshopify.com")
     - **Shopify Access Token:** (Optional) For private API access
     - **Max Products:** Maximum products allowed (default: 10000)

3. **Click "Create Tenant"**
   - Tenant is created with default RAG configuration
   - Default settings are applied

### Syncing Products

1. **Find your tenant in the list**
2. **Click the three dots menu (⋮)**
3. **Select "Sync Products"**
4. Wait for sync to complete (toast notification)
5. Product count updates in the table

**Note:** First sync may take a few minutes depending on product count.

### Generating Embeddings

**Prerequisites:** Products must be synced first

1. **Click the three dots menu (⋮) on your tenant**
2. **Select "Generate Embeddings"**
3. Wait for embedding generation (may take several minutes)
4. Embeddings count updates in tenant stats

**Note:** Embeddings enable semantic search. Without them, chat won't work properly.

### Customizing Widget Appearance

1. **Click "Edit Settings" on your tenant**
2. **Appearance Tab:**
   - **Primary Color:** Main brand color (buttons, header)
   - **Secondary Color:** Secondary color (user messages)
   - **Widget Position:** Choose from 4 corners
   - **Chat Title:** e.g., "Shop Assistant"
   - **Welcome Message:** First message shown to users

3. **Behavior Tab:**
   - **Auto-open:** Enable/disable automatic widget opening
   - **Auto-open Delay:** Seconds before auto-open (5-60s)
   - **Typing Indicator:** Show "AI is thinking..." animation

4. **Live Preview:**
   - See changes in real-time on the right side
   - Preview shows actual widget appearance

5. **Click "Save Settings"**

### Getting Embed Code (Admin Only)

1. **Go to tenant settings**
2. **Click "Embed Code" tab**
3. **Copy the JavaScript code**
4. **Paste before `</body>` tag in your website:**

```html
<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantId: 1,
    tenantSlug: 'your-store',
    apiUrl: 'http://localhost:5078',
    customization: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      position: 'bottom-right',
      chatTitle: 'Chat with us',
      welcomeMessage: 'Hello! How can I help you today?',
      autoOpen: false,
      autoOpenDelay: 5,
      showTypingIndicator: true
    }
  };
</script>
<script src="http://localhost:5078/widget/widget.js"></script>
```

### Managing Users (Admin Only)

1. **Navigate to "Users Management"**
2. **Find user in the list**
3. **Click three dots menu (⋮)**
4. **Select "Manage Tenants"**
5. **Check/uncheck tenants to assign/remove**
6. User can now access assigned tenants

### Testing Chat

1. **Navigate to "Chat Test"**
2. **Select tenant from dropdown**
3. **Type a message:** e.g., "Show me blue dresses under $100"
4. **AI responds with relevant products**
5. Test different queries to verify RAG is working

---

## ⚙️ Configuration

### Backend API Configuration

**File:** `authentication/SecureAuth.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=feattie;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters-required-for-production",
    "Issuer": "SecureAuth.Api",
    "Audience": "SecureAuth.Client",
    "ExpiryMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  },
  "PythonRAG": {
    "BaseUrl": "http://localhost:8000"
  },
  "OpenAI": {
    "ApiKey": "sk-your-openai-api-key-here"
  }
}
```

### Frontend Configuration

**File:** `admin-dashboard/.env`

```env
VITE_API_URL=http://localhost:5078
```

### Python RAG Configuration

**File:** `.env` (project root)

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Website                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Embedded Chat Widget (JavaScript)                 │    │
│  │  - Loads tenant config via API                     │    │
│  │  - Renders chat interface                          │    │
│  │  - Sends messages to chat endpoint                 │    │
│  └──────────────────┬─────────────────────────────────┘    │
└─────────────────────┼──────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            .NET Core API (Port 5078)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Public Endpoints (No Authentication):               │  │
│  │  - GET  /api/widget/config/{slug}                    │  │
│  │  - POST /api/chat/{tenantId}                         │  │
│  │  - GET  /api/chat/{tenantId}/history/{sessionId}    │  │
│  │  - GET  /widget/widget.js                            │  │
│  │                                                       │  │
│  │  Authenticated Endpoints:                            │  │
│  │  - POST /api/auth/login                              │  │
│  │  - GET  /api/tenant                                  │  │
│  │  - POST /api/tenant                                  │  │
│  │  - GET  /api/tenants/{id}/settings                  │  │
│  │  - PUT  /api/tenants/{id}/settings                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             │                        │ HTTP
             ▼                        ▼
┌──────────────────────┐  ┌──────────────────────────────────┐
│   PostgreSQL DB      │  │   Python RAG Service (Port 8000) │
│   (Port 5432)        │  │  ┌─────────────────────────────┐ │
│                      │  │  │ - Sentence Transformers     │ │
│  - Users             │  │  │ - OpenAI GPT-4o-mini        │ │
│  - Tenants           │  │  │ - Embedding generation      │ │
│  - TenantSettings    │  │  │ - Semantic search           │ │
│  - Products          │  │  │ - RAG pipeline              │ │
│  - ChatSessions      │  │  │ - Context injection         │ │
│  - ChatMessages      │  │  └─────────────────────────────┘ │
│  - Contexts          │  └──────────────────────────────────┘
│  - RAGConfigurations │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Admin Dashboard (React + Vite - Port 5173)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages:                                              │  │
│  │  - Dashboard (system stats)                          │  │
│  │  - Tenant Management (CRUD)                          │  │
│  │  - User Management (assign to tenants)               │  │
│  │  - Widget Settings (customization + live preview)    │  │
│  │  - Chat Test (test AI chat)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/widget/config/{tenantSlug}` | Get widget configuration | - |
| POST | `/api/chat/{tenantId}` | Send chat message | `{ query, sessionId?, topK? }` |
| GET | `/api/chat/{tenantId}/history/{sessionId}` | Get chat history | - |
| GET | `/widget/widget.js` | Widget JavaScript file | - |

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | `{ email, password }` |
| POST | `/api/auth/register` | Register new user | `{ email, password, firstName?, lastName? }` |
| POST | `/api/auth/logout` | Logout | - |
| GET | `/api/auth/me` | Get current user info | - |
| GET | `/api/auth/me/tenants` | Get user's assigned tenants | - |

### Tenant Management (Admin Only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tenant` | List all tenants | Query: `isActive?, page?, pageSize?` |
| GET | `/api/tenant/{id}` | Get tenant by ID | - |
| GET | `/api/tenant/by-slug/{slug}` | Get tenant by slug | - |
| POST | `/api/tenant` | Create new tenant | `{ Name, Slug, ShopifyStoreUrl, ShopifyAccessToken?, MaxProducts? }` |
| PUT | `/api/tenant/{id}` | Update tenant | `{ Name?, ShopifyStoreUrl?, IsActive?, MaxProducts? }` |
| DELETE | `/api/tenant/{id}` | Delete tenant (soft delete) | Query: `permanent?` |
| GET | `/api/tenant/{id}/stats` | Get tenant statistics | - |

### User-Tenant Management (Admin Only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/auth/admin/users` | List all users | Query: `search?, page?, pageSize?` |
| GET | `/api/auth/admin/users/{userId}/tenants` | Get user's tenants | - |
| POST | `/api/auth/admin/users/{userId}/tenants/{tenantId}` | Assign user to tenant | `{ role? }` |
| DELETE | `/api/auth/admin/users/{userId}/tenants/{tenantId}` | Remove user from tenant | - |

### Tenant Settings (User & Admin)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tenants/{id}/settings` | Get tenant settings | - |
| PUT | `/api/tenants/{id}/settings` | Update tenant settings | `{ brandColorPrimary?, brandColorSecondary?, widgetPosition?, chatTitle?, welcomeMessage?, autoOpen?, autoOpenDelaySeconds?, showTypingIndicator? }` |
| GET | `/api/tenants/{id}/settings/embed-code` | Get embed code (Admin) | - |

### Product Management (Admin Only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tenants/{id}/products` | List products | Query: `hasEmbedding?, page?, pageSize?` |
| POST | `/api/tenants/{id}/products/sync` | Sync products from Shopify | `{ forceResync? }` |
| POST | `/api/tenants/{id}/products/generate-embeddings` | Generate embeddings | `{ forceRegenerate? }` |
| GET | `/api/tenants/{id}/products/stats` | Get product statistics | - |

### RAG Configuration (Admin Only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tenants/{id}/rag-config` | Get RAG configuration | - |
| PUT | `/api/tenants/{id}/rag-config` | Update RAG configuration | `{ embeddingModel?, llmModel?, systemPrompt?, temperature?, ... }` |

---

## 🗂️ Project Structure

```
feattie/
├── authentication/SecureAuth.Api/        # .NET Core Backend API
│   ├── Controllers/
│   │   ├── AuthController.cs            # Authentication & user management
│   │   ├── TenantController.cs          # Tenant CRUD operations
│   │   ├── TenantSettingsController.cs  # Widget settings
│   │   ├── ChatController.cs            # Chat API
│   │   ├── ProductController.cs         # Product sync & embeddings
│   │   └── RAGConfigurationController.cs # RAG settings
│   ├── Models/
│   │   ├── User.cs                      # User model
│   │   ├── Tenant.cs                    # Tenant model
│   │   ├── TenantUser.cs                # User-Tenant junction
│   │   ├── TenantSettings.cs            # Widget settings
│   │   ├── Product.cs                   # Product model
│   │   ├── ChatSession.cs               # Chat session
│   │   ├── ChatMessage.cs               # Chat message
│   │   ├── RAGConfiguration.cs          # RAG config
│   │   └── Context.cs                   # Custom context
│   ├── Services/
│   │   ├── ShopifyService.cs            # Shopify integration
│   │   ├── PythonRAGService.cs          # Python RAG client
│   │   └── ProductService.cs            # Product operations
│   ├── Data/
│   │   └── AppDbContext.cs              # Entity Framework DbContext
│   ├── DTOs/                             # Data Transfer Objects
│   ├── Migrations/                       # EF Core migrations
│   ├── wwwroot/widget/
│   │   └── widget.js                    # Embeddable widget script
│   ├── Program.cs                        # Application entry point
│   ├── appsettings.json                 # Configuration
│   └── appsettings.Development.json     # Dev configuration
│
├── admin-dashboard/                      # React Admin Dashboard
│   ├── app/                              # Next.js App Router
│   │   ├── page.tsx                     # Dashboard home
│   │   ├── tenants/
│   │   │   └── page.tsx                 # Tenant management
│   │   ├── users/
│   │   │   └── page.tsx                 # User management
│   │   ├── tenant-settings/
│   │   │   └── page.tsx                 # Widget settings
│   │   ├── chat/
│   │   │   └── page.tsx                 # Chat test
│   │   └── auth/
│   │       └── login/
│   │           └── page.tsx             # Login page
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   └── AdminLayout.tsx              # Layout with sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context
│   ├── lib/
│   │   ├── api.ts                       # API client (axios)
│   │   └── utils.ts                     # Utility functions
│   ├── hooks/
│   │   └── use-toast.tsx                # Toast notifications
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env                              # Environment variables
│
├── src/                                  # Python RAG Service
│   ├── api/
│   │   └── tenant_server.py             # FastAPI server
│   ├── embeddings/
│   │   ├── local_embeddings.py          # Sentence Transformers
│   │   └── openai_embeddings.py         # OpenAI embeddings
│   ├── models/
│   │   └── tenant_models.py             # Pydantic models
│   └── services/
│       ├── llm_service.py               # OpenAI LLM integration
│       └── rag_service.py               # RAG pipeline
│
├── scripts/
│   ├── shop_pull.py                     # Shopify product scraper
│   └── add-admin.sh                     # Add admin user script
│
├── requirements.txt                      # Python dependencies
├── package.json                          # Project metadata
├── .env                                  # Environment variables
├── .env.example                          # Example env file
├── README.md                             # This file
├── QUICK_START.md                        # Quick start guide
└── OPENAI_SETUP.md                       # OpenAI setup guide
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes on specific ports
lsof -ti:5078 | xargs kill -9  # .NET API
lsof -ti:8000 | xargs kill -9  # Python RAG
lsof -ti:5173 | xargs kill -9  # Admin Dashboard
lsof -ti:5432 | xargs kill -9  # PostgreSQL

# Or kill all at once
lsof -ti:5078,8000,5173 | xargs kill -9
```

### Database Connection Failed

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. **Check connection string in `appsettings.json`:**
   ```json
   "ConnectionStrings": {
     "Default": "Host=localhost;Port=5432;Database=feattie;Username=postgres;Password=postgres"
   }
   ```

3. **Ensure database exists:**
   ```sql
   psql -U postgres
   CREATE DATABASE feattie;
   \q
   ```

4. **Run migrations:**
   ```bash
   cd authentication/SecureAuth.Api
   dotnet ef database update
   ```

### Python Module Not Found

```bash
# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Set PYTHONPATH
export PYTHONPATH=$PWD     # macOS/Linux
set PYTHONPATH=%CD%        # Windows

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Migrations Error

```bash
cd authentication/SecureAuth.Api

# Drop and recreate database (WARNING: deletes all data)
dotnet ef database drop --force
dotnet ef database update

# Or create new migration
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

### Chat Not Working

**Checklist:**

1. ✅ All 3 services running (API, RAG, Frontend)
2. ✅ Tenant has products synced
3. ✅ Embeddings are generated for products
4. ✅ OpenAI API key is set in `appsettings.json`
5. ✅ RAG service URL is correct in `appsettings.json`
6. ✅ Check browser console for errors
7. ✅ Check API logs for errors
8. ✅ Check RAG service logs for errors

### CORS Errors

Update `appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-production-domain.com"
  ]
}
```

### Widget Not Loading

1. Check widget URL is correct
2. Check CORS is configured for customer domain
3. Check tenant slug is correct
4. Open browser console and check for errors
5. Verify tenant is active: `IsActive = true`

---

## 🔒 Security & Production Deployment

### Pre-Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters, random)
- [ ] Enable HTTPS/SSL
- [ ] Store API keys in environment variables (not in code)
- [ ] Set `AllowedOrigins` in CORS to actual domain
- [ ] Enable rate limiting
- [ ] Set up regular database backups
- [ ] Update all dependencies
- [ ] Remove default test users
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Use production-grade PostgreSQL (e.g., RDS, Azure DB)
- [ ] Set up logging (Serilog, Application Insights)
- [ ] Set up monitoring (health checks, uptime)

### Environment Variables (Production)

```bash
# .NET API
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default="Host=prod-db.example.com;Port=5432;Database=feattie;Username=app_user;Password=secure_password"
Jwt__Secret="production-secret-key-at-least-32-characters-long-and-random"
Jwt__ExpiryMinutes=60
OpenAI__ApiKey="sk-prod-openai-api-key"
Cors__AllowedOrigins__0="https://admin.yourdomain.com"
PythonRAG__BaseUrl="https://rag.yourdomain.com"

# Python RAG
OPENAI_API_KEY="sk-prod-openai-api-key"
PYTHONPATH=/app

# Admin Dashboard (build time)
VITE_API_URL=https://api.yourdomain.com
```

### Required API Keys

1. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Used for: Embeddings (`text-embedding-3-small`) & Chat (`gpt-4o-mini`)
   - Pricing: ~$0.02 per 1M tokens (embeddings), ~$0.15 per 1M tokens (chat)

2. **Shopify Access Token** (per tenant, optional)
   - For private apps: Create in Shopify Admin → Apps → Develop apps
   - Required permissions: `read_products`
   - Not required if using public Shopify API

### Production Deployment (Docker)

```dockerfile
# Dockerfile for .NET API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5078

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["authentication/SecureAuth.Api/SecureAuth.Api.csproj", "authentication/SecureAuth.Api/"]
RUN dotnet restore "authentication/SecureAuth.Api/SecureAuth.Api.csproj"
COPY . .
WORKDIR "/src/authentication/SecureAuth.Api"
RUN dotnet build "SecureAuth.Api.csproj" -c Release -o /app/build
RUN dotnet publish "SecureAuth.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SecureAuth.Api.dll"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: feattie
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "5078:5078"
    environment:
      - ConnectionStrings__Default=Host=postgres;Database=feattie;Username=postgres;Password=${DB_PASSWORD}
      - Jwt__Secret=${JWT_SECRET}
      - OpenAI__ApiKey=${OPENAI_API_KEY}
    depends_on:
      - postgres

  rag:
    build:
      context: .
      dockerfile: Dockerfile.rag
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PYTHONPATH=/app
    depends_on:
      - postgres

  admin:
    build:
      context: ./admin-dashboard
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://api:5078

volumes:
  postgres_data:
```

---

## 📊 Database Schema

### Key Tables

- **Users**: User accounts (admin & regular users)
- **Tenants**: Business accounts (e-commerce stores)
- **TenantUsers**: Many-to-many relationship (users can access multiple tenants)
- **TenantSettings**: Widget customization per tenant
- **Products**: Product catalog per tenant
- **RAGConfigurations**: AI/LLM settings per tenant
- **Contexts**: Custom context snippets per tenant
- **ChatSessions**: Chat sessions
- **ChatMessages**: Chat message history

---

## 📝 Default Test Users

| Email | Password | Role | Tenants Assigned |
|-------|----------|------|------------------|
| admin@example.com | Admin123! | Admin | All |
| admin@test.com | Test123! | Admin | All |
| john@test.com | Test123! | User | None (assign manually) |
| jane@test.com | Test123! | User | None (assign manually) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Support & Contact

For questions, issues, or feature requests:
- **GitHub Issues:** [Your Repo Issues]
- **Email:** [Your Email]
- **Documentation:** See `QUICK_START.md` and `OPENAI_SETUP.md`

---

## 🎯 Roadmap

### v1.1 (Coming Soon)
- [ ] Widget analytics (views, messages, conversions)
- [ ] Multiple language support for dashboard
- [ ] Email notifications for admins
- [ ] Webhook support for Shopify product updates
- [ ] Custom CSS editor with syntax highlighting

### v1.2 (Future)
- [ ] WooCommerce integration
- [ ] WhatsApp integration
- [ ] Voice chat support
- [ ] A/B testing for widget variants
- [ ] Mobile app for admin dashboard

---

**Built with ❤️ for modern e-commerce businesses**

**Powered by:** .NET 9.0 | React 18 | OpenAI | PostgreSQL | Python 3.11
