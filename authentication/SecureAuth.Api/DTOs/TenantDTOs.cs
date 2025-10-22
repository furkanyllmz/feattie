namespace SecureAuth.Api.DTOs;

// === TENANT DTOs ===

public record CreateTenantRequest(
    string Name,
    string Slug,
    string ShopifyStoreUrl,
    string? ShopifyAccessToken = null,
    int MaxProducts = 10000
);

public record UpdateTenantRequest(
    string? Name = null,
    string? ShopifyStoreUrl = null,
    string? ShopifyAccessToken = null,
    bool? IsActive = null,
    int? MaxProducts = null
);

public record TenantResponse(
    int Id,
    string Name,
    string Slug,
    string ShopifyStoreUrl,
    bool IsActive,
    DateTime? SubscriptionExpires,
    int MaxProducts,
    int ProductCount,
    DateTime? LastProductSync,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool HasRAGConfiguration
);

public record TenantListItemResponse(
    int Id,
    string Name,
    string Slug,
    bool IsActive,
    int ProductCount,
    DateTime? LastProductSync,
    DateTime CreatedAt
);

// === TENANT USER DTOs ===

public record AddUserToTenantRequest(
    int UserId,
    string Role // "VIEWER", "EDITOR", "ADMIN"
);

public record TenantUserResponse(
    int Id,
    int UserId,
    string UserEmail,
    string? UserName,
    string Role,
    DateTime JoinedAt
);

// === PRODUCT DTOs ===

public record ProductResponse(
    int Id,
    long ShopifyProductId,
    long ShopifyVariantId,
    string Title,
    string Vendor,
    string ProductType,
    decimal Price,
    string[] Colors,
    string[] Sizes,
    string[] Tags,
    bool HasEmbedding,
    string? ImageUrl,
    string? Handle,
    DateTime SyncedAt
);

public record SyncProductsRequest(
    bool ForceResync = false
);

public record SyncProductsResponse(
    bool Success,
    int TotalProducts,
    int NewProducts,
    int UpdatedProducts,
    int FailedProducts,
    string? ErrorMessage = null
);
