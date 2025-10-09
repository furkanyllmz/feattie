# SecureAuth API

A comprehensive authentication and user management API built with ASP.NET Core 9.0, featuring JWT authentication, role-based authorization, and advanced user management capabilities.

## Features

### Authentication & Authorization
- **JWT Token Authentication** with HttpOnly cookies
- **Role-based Authorization** (USER, ADMIN)
- **Password Security** with BCrypt hashing
- **Secure Cookie Management** with HttpOnly, Secure, and SameSite settings

### User Management
- **User Registration & Login**
- **Password Management** (Change, Reset, Forgot Password)
- **Profile Management** (Update email, name, etc.)
- **Email Verification** system (ready for integration)

### Admin Features
- **User Administration** with comprehensive dashboard
- **User Ban System** (temporary and permanent bans)
- **Role Management** (promote/demote users)
- **User Analytics** and statistics
- **Advanced User Filtering** and search

### Security Features
- **Automatic Ban Expiration** handling
- **Session Management** with last login tracking
- **CORS Configuration** for frontend integration
- **Input Validation** and sanitization

## Technology Stack

- **Framework**: ASP.NET Core 9.0
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Password Hashing**: BCrypt.Net
- **API Documentation**: Swagger/OpenAPI
- **Architecture**: RESTful API with minimal API principles

## Prerequisites

- .NET 9.0 SDK
- PostgreSQL 12+
- Visual Studio 2022 or VS Code

## Installation & Setup

### 1. Clone and Navigate
```bash
cd authentication/SecureAuth.Api
```

### 2. Database Setup
Make sure PostgreSQL is running and create a database:
```sql
CREATE DATABASE mini_auth;
```

### 3. Configuration
Update `appsettings.json` with your settings:
```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=mini_auth;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Issuer": "mini-auth",
    "Audience": "mini-auth",
    "Secret": "YOUR-SUPER-SECURE-JWT-SECRET-KEY-MINIMUM-32-CHARACTERS",
    "ExpiresMinutes": 60
  },
  "Cors": {
    "AllowedOrigin": "http://localhost:5173"
  }
}
```

### 4. Run Migrations
```bash
dotnet ef database update
```

### 5. Start the Application
```bash
dotnet run
```

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger**: `https://localhost:5001/swagger`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Password Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| POST | `/api/auth/change-password` | Change current password | Yes |

### Profile Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Admin Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/admin/dashboard` | Get admin dashboard stats |
| GET | `/api/auth/admin/users` | List all users with pagination |
| PUT | `/api/auth/admin/users/{id}/role` | Update user role |
| POST | `/api/auth/admin/users/{id}/ban` | Ban user |
| POST | `/api/auth/admin/users/{id}/unban` | Remove user ban |
| GET | `/api/auth/admin/secret` | Test admin-only endpoint |

## API Usage Examples

### Registration
```bash
curl -X POST "https://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST "https://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User (with auth cookie)
```bash
curl -X GET "https://localhost:5001/api/auth/me" \
  --cookie "jwt=YOUR_JWT_TOKEN"
```

### Admin: Get Users List
```bash
curl -X GET "https://localhost:5001/api/auth/admin/users?page=1&pageSize=10&search=john" \
  --cookie "jwt=ADMIN_JWT_TOKEN"
```

### Admin: Ban User
```bash
curl -X POST "https://localhost:5001/api/auth/admin/users/5/ban" \
  -H "Content-Type: application/json" \
  --cookie "jwt=ADMIN_JWT_TOKEN" \
  -d '{
    "reason": "Violating terms of service",
    "durationDays": 7
  }'
```

## Database Schema

### User Entity
```csharp
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public Role Role { get; set; } // USER, ADMIN
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Password Reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpires { get; set; }
    
    // Email Verification
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpires { get; set; }
    
    // Ban System
    public bool IsBanned { get; set; }
    public string? BanReason { get; set; }
    public DateTime? BannedAt { get; set; }
    public DateTime? BanExpires { get; set; }
}
```

## Default Test Data

The application automatically creates test data on first run:

### Admin Accounts
- **Email**: `admin@example.com` | **Password**: `Admin123!`
- **Email**: `admin@test.com` | **Password**: `Test123!`
- **Email**: `manager@test.com` | **Password**: `Test123!`

### Regular Users
- **Email**: `john@test.com` | **Password**: `Test123!`
- **Email**: `jane@test.com` | **Password**: `Test123!`
- **Email**: `mike@test.com` | **Password**: `Test123!`
- **Email**: `lisa@test.com` | **Password**: `Test123!`

### Test Cases
- **Unverified Email**: `sarah@test.com`
- **Inactive User**: `david@test.com`
- **Banned User**: `banned@test.com` (permanent ban)
- **Temp Banned**: `temp.banned@test.com` (5 days)

## Security Considerations

### JWT Security
- Tokens stored in HttpOnly cookies (XSS protection)
- Secure flag enabled for HTTPS
- SameSite=Strict for CSRF protection
- Configurable expiration time

### Password Security
- BCrypt hashing with automatic salt generation
- Minimum 6 character requirement
- Secure password reset flow with time-limited tokens

### Authorization
- Role-based access control
- Protected admin endpoints
- Automatic ban expiration handling

## Deployment

### Environment Variables
```bash
ConnectionStrings__Default=YOUR_POSTGRES_CONNECTION_STRING
Jwt__Secret=YOUR_JWT_SECRET_KEY
Jwt__Issuer=your-app-name
Jwt__Audience=your-app-name
Cors__AllowedOrigin=https://your-frontend-domain.com
```

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["SecureAuth.Api.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SecureAuth.Api.dll"]
```

## Testing

### Using Swagger UI
1. Navigate to `https://localhost:5001/swagger`
2. Register a new user or use test credentials
3. Login to get authentication cookie
4. Test protected endpoints

### Postman Collection
Import the API endpoints into Postman:
- Set `{{baseUrl}}` to `https://localhost:5001`
- Enable cookie jar for authentication
- Test all endpoints with different user roles

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Descriptive error message"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add appropriate tests
5. Submit a pull request

---

**Built with using ASP.NET Core 9.0**