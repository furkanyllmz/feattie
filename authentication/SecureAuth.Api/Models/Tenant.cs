namespace SecureAuth.Api.Models;

/// <summary>
/// Represents a tenant (business/company) in the multi-tenant system
/// Each tenant has its own Shopify store, products, and RAG configuration
/// </summary>
public class Tenant
{
    public int Id { get; set; }

    // Tenant identification
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!; // URL-friendly identifier (e.g., "lesbenjamins")

    // Shopify configuration
    public string ShopifyStoreUrl { get; set; } = default!; // e.g., "https://lesbenjamins.com"
    public string? ShopifyAccessToken { get; set; } // Optional: For private app API access

    // Subscription & Status
    public bool IsActive { get; set; } = true;
    public DateTime? SubscriptionExpires { get; set; }
    public int MaxProducts { get; set; } = 10000; // Product limit

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Last sync info
    public DateTime? LastProductSync { get; set; }
    public int ProductCount { get; set; } = 0;

    // Navigation properties
    public ICollection<TenantUser> TenantUsers { get; set; } = new List<TenantUser>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public RAGConfiguration? RAGConfiguration { get; set; }
    public TenantSettings? Settings { get; set; }
}

/// <summary>
/// Junction table for User-Tenant many-to-many relationship
/// Allows users to manage multiple tenants
/// </summary>
public class TenantUser
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    // Role within this tenant
    public TenantRole Role { get; set; } = TenantRole.VIEWER;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public enum TenantRole
{
    VIEWER,   // Can only view
    EDITOR,   // Can edit RAG config
    ADMIN     // Full control over tenant
}
