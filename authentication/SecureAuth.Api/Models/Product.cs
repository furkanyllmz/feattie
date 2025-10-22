namespace SecureAuth.Api.Models;

/// <summary>
/// Represents a product from Shopify store
/// Stores product data and metadata for RAG system
/// </summary>
public class Product
{
    public int Id { get; set; }

    // Tenant association
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    // Shopify IDs
    public long ShopifyProductId { get; set; } // Original Shopify product ID
    public long ShopifyVariantId { get; set; } // Variant ID

    // Product information
    public string Title { get; set; } = default!;
    public string Vendor { get; set; } = default!;
    public string ProductType { get; set; } = default!;
    public decimal Price { get; set; }

    // Product attributes (stored as JSON)
    public string ColorsJson { get; set; } = "[]"; // ["Black", "White"]
    public string SizesJson { get; set; } = "[]";  // ["XS", "S", "M", "L"]
    public string TagsJson { get; set; } = "[]";   // Product tags

    // Full text for RAG
    public string SearchableText { get; set; } = default!; // Combined text for embedding

    // Embedding data
    public string? EmbeddingJson { get; set; } // Stores the embedding vector as JSON array
    public bool HasEmbedding { get; set; } = false;

    // Metadata
    public string? ImageUrl { get; set; }
    public string? Handle { get; set; } // Shopify handle (URL slug)

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SyncedAt { get; set; } // Last time synced from Shopify
}
