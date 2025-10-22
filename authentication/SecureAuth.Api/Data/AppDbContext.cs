using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Authentication
    public DbSet<User> Users => Set<User>();

    // Multi-tenant RAG system
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<RAGConfiguration> RAGConfigurations => Set<RAGConfiguration>();
    public DbSet<Context> Contexts => Set<Context>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // === USER CONFIGURATION ===
        b.Entity<User>()
         .HasIndex(u => u.Email)
         .IsUnique();

        b.Entity<User>()
         .Property(u => u.Email)
         .HasMaxLength(320);

        // === TENANT CONFIGURATION ===
        b.Entity<Tenant>()
         .HasIndex(t => t.Slug)
         .IsUnique();

        b.Entity<Tenant>()
         .Property(t => t.Name)
         .HasMaxLength(200)
         .IsRequired();

        b.Entity<Tenant>()
         .Property(t => t.Slug)
         .HasMaxLength(100)
         .IsRequired();

        b.Entity<Tenant>()
         .Property(t => t.ShopifyStoreUrl)
         .HasMaxLength(500)
         .IsRequired();

        // === TENANT-USER RELATIONSHIP ===
        b.Entity<TenantUser>()
         .HasOne(tu => tu.Tenant)
         .WithMany(t => t.TenantUsers)
         .HasForeignKey(tu => tu.TenantId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<TenantUser>()
         .HasOne(tu => tu.User)
         .WithMany(u => u.TenantUsers)
         .HasForeignKey(tu => tu.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<TenantUser>()
         .HasIndex(tu => new { tu.TenantId, tu.UserId })
         .IsUnique();

        // === PRODUCT CONFIGURATION ===
        b.Entity<Product>()
         .HasOne(p => p.Tenant)
         .WithMany(t => t.Products)
         .HasForeignKey(p => p.TenantId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Product>()
         .HasIndex(p => new { p.TenantId, p.ShopifyProductId, p.ShopifyVariantId })
         .IsUnique();

        b.Entity<Product>()
         .Property(p => p.Title)
         .HasMaxLength(500)
         .IsRequired();

        b.Entity<Product>()
         .Property(p => p.Price)
         .HasPrecision(18, 2);

        // === RAG CONFIGURATION ===
        b.Entity<RAGConfiguration>()
         .HasOne(r => r.Tenant)
         .WithOne(t => t.RAGConfiguration)
         .HasForeignKey<RAGConfiguration>(r => r.TenantId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<RAGConfiguration>()
         .Property(r => r.LLMTemperature)
         .HasPrecision(3, 2);

        b.Entity<RAGConfiguration>()
         .Property(r => r.MinimumSimilarityScore)
         .HasPrecision(3, 2);

        // === CONTEXT CONFIGURATION ===
        b.Entity<Context>()
         .HasOne(c => c.Tenant)
         .WithMany()
         .HasForeignKey(c => c.TenantId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Context>()
         .HasIndex(c => new { c.TenantId, c.Slug })
         .IsUnique();

        b.Entity<Context>()
         .Property(c => c.Title)
         .HasMaxLength(200)
         .IsRequired();

        // === CHAT SESSION CONFIGURATION ===
        b.Entity<ChatSession>()
         .HasOne(cs => cs.Tenant)
         .WithMany()
         .HasForeignKey(cs => cs.TenantId)
         .OnDelete(DeleteBehavior.Cascade);

        b.Entity<ChatSession>()
         .HasIndex(cs => cs.SessionId);

        // === CHAT MESSAGE CONFIGURATION ===
        b.Entity<ChatMessage>()
         .HasOne(cm => cm.ChatSession)
         .WithMany(cs => cs.Messages)
         .HasForeignKey(cm => cm.ChatSessionId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
