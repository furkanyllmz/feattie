using SecureAuth.Api.DTOs;

namespace SecureAuth.Api.Services;

public interface IProductService
{
    /// <summary>
    /// Sync products from Shopify for a tenant
    /// </summary>
    Task<SyncProductsResponse> SyncProductsAsync(int tenantId, bool forceResync = false);

    /// <summary>
    /// Generate embeddings for tenant products
    /// </summary>
    Task<GenerateEmbeddingsResponse> GenerateEmbeddingsAsync(int tenantId, bool forceRegenerate = false);
}
