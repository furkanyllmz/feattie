using System.T// CORS (set frontend origi        // Don't automatically read from header since we'll store in cookie; we'll validate manually.
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                // Extract token from HttpOnly cookie "jwt"
                if (ctx.Request.Cookies.TryGetValue("jwt", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };gin = cfg["Cors:AllowedOrigin"]!;t;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SecureAuth.Api.Data;
using SecureAuth.Api.Models;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// Db
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(cfg.GetConnectionString("Default")));

// CORS (frontend origin’i ayarla)
var origin = cfg["Cors:AllowedOrigin"]!;
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins(origin)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// JWT
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Secret"]!));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new()
        {
            ValidIssuer = cfg["Jwt:Issuer"],
            ValidAudience = cfg["Jwt:Audience"],
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true
        };
        // Cookie’de saklayacağımız için header’dan otomatik okumasın; manuel doğrulayacağız.
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                // HttpOnly cookie "jwt" içinden token’ı çek
                if (ctx.Request.Cookies.TryGetValue("jwt", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("AdminOnly", p => p.RequireRole(nameof(Role.ADMIN)));
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();
var app = builder.Build();

// Enable Swagger in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Simple seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any(u => u.Role == Role.ADMIN))
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        db.Users.Add(new User { Email = "admin@example.com", PasswordHash = hash, Role = Role.ADMIN });
        db.SaveChanges();
        Console.WriteLine("Admin ready: admin@example.com / Admin123!");
    }

    // Create test data
    if (db.Users.Count() < 5)
    {
        var testUsers = new List<User>
        {
            new User 
            { 
                Email = "admin@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.ADMIN,
                FirstName = "Admin",
                LastName = "User",
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new User 
            { 
                Email = "manager@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.ADMIN,
                FirstName = "Manager",
                LastName = "Admin",
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddDays(-25)
            },
            new User 
            { 
                Email = "john@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "John",
                LastName = "Doe",
                IsActive = true,
                EmailVerified = true,
                LastLoginAt = DateTime.UtcNow.AddHours(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new User 
            { 
                Email = "jane@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Jane",
                LastName = "Smith",
                IsActive = true,
                EmailVerified = true,
                LastLoginAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-18)
            },
            new User 
            { 
                Email = "mike@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Mike",
                LastName = "Johnson",
                IsActive = true,
                EmailVerified = true,
                LastLoginAt = DateTime.UtcNow.AddHours(-6),
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new User 
            { 
                Email = "sarah@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Sarah",
                LastName = "Wilson",
                IsActive = true,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new User 
            { 
                Email = "david@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "David",
                LastName = "Brown",
                IsActive = false,
                EmailVerified = true,
                LastLoginAt = DateTime.UtcNow.AddDays(-30),
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new User 
            { 
                Email = "banned@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Banned",
                LastName = "User",
                IsActive = false,
                EmailVerified = true,
                IsBanned = true,
                BanReason = "Sending spam",
                BannedAt = DateTime.UtcNow.AddDays(-5),
                BanExpires = DateTime.UtcNow.AddDays(25),
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new User 
            { 
                Email = "temp.banned@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Temp",
                LastName = "Banned",
                IsActive = false,
                EmailVerified = true,
                IsBanned = true,
                BanReason = "Inappropriate behavior - temporary ban",
                BannedAt = DateTime.UtcNow.AddDays(-2),
                BanExpires = DateTime.UtcNow.AddDays(5),
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new User 
            { 
                Email = "lisa@test.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"), 
                Role = Role.USER,
                FirstName = "Lisa",
                LastName = "Anderson",
                IsActive = true,
                EmailVerified = true,
                LastLoginAt = DateTime.UtcNow.AddMinutes(-30),
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            }
        };

        foreach (var user in testUsers)
        {
            if (!db.Users.Any(u => u.Email == user.Email))
            {
                db.Users.Add(user);
            }
        }

        db.SaveChanges();
        Console.WriteLine($"✅ Test data created! Total of {db.Users.Count()} users available.");
        Console.WriteLine("📊 Admin: 3, Normal: 7 users");
        Console.WriteLine("🚫 2 banned, 1 inactive user");
        Console.WriteLine("🔑 All passwords: Test123!");
    }
}

app.Run();
