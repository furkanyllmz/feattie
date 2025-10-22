namespace SecureAuth.Api.Models;

/// <summary>
/// Custom context/knowledge snippets that can be injected into RAG responses
/// Examples: Store policies, shipping info, promotions, FAQs
/// </summary>
public class Context
{
    public int Id { get; set; }

    // Tenant association
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    // Context identification
    public string Title { get; set; } = default!; // e.g., "Shipping Policy"
    public string Slug { get; set; } = default!; // URL-friendly identifier

    // Content
    public string Content { get; set; } = default!; // The actual context text
    public ContextType Type { get; set; } = ContextType.GENERAL;

    // Trigger configuration
    public string[] TriggerKeywords { get; set; } = Array.Empty<string>(); // When to inject this context
    public bool AlwaysInclude { get; set; } = false; // Include in every response

    // Priority (higher = more important)
    public int Priority { get; set; } = 0;

    // Status
    public bool IsActive { get; set; } = true;

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum ContextType
{
    GENERAL,            // General info
    SHIPPING,           // Shipping & delivery
    RETURNS,            // Return policy
    PAYMENT,            // Payment methods
    PROMOTION,          // Current promotions
    FAQ,                // Frequently asked questions
    BRAND_STORY,        // About the brand
    SIZE_GUIDE,         // Size charts
    CARE_INSTRUCTIONS   // Product care
}
