using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly IShopifyService _shopifyService;
    private readonly IPythonRAGService _ragService;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        AppDbContext context,
        IShopifyService shopifyService,
        IPythonRAGService ragService,
        ILogger<ProductService> logger)
    {
        _context = context;
        _shopifyService = shopifyService;
        _ragService = ragService;
        _logger = logger;
    }

    public async Task<SyncProductsResponse> SyncProductsAsync(int tenantId, bool forceResync = false)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return new SyncProductsResponse(false, 0, 0, 0, 0, "Tenant not found");
        }

        _logger.LogInformation("Starting product sync for tenant {TenantId} ({TenantName})",
            tenantId, tenant.Name);

        try
        {
            // Fetch products from Shopify
            var shopifyProducts = await _shopifyService.FetchProductsAsync(
                tenant.ShopifyStoreUrl,
                tenant.ShopifyAccessToken
            );

            int newProducts = 0;
            int updatedProducts = 0;
            int failedProducts = 0;

            foreach (var shopifyProduct in shopifyProducts)
            {
                foreach (var variant in shopifyProduct.Variants)
                {
                    try
                    {
                        // Check if product variant exists
                        var existingProduct = await _context.Products
                            .FirstOrDefaultAsync(p =>
                                p.TenantId == tenantId &&
                                p.ShopifyProductId == shopifyProduct.Id &&
                                p.ShopifyVariantId == variant.Id
                            );

                        var colors = ExtractColors(shopifyProduct, variant);
                        var sizes = ExtractSizes(shopifyProduct, variant);
                        var tags = shopifyProduct.Tags;

                        var searchableText = BuildSearchableText(shopifyProduct, variant, colors, sizes, tags);

                        if (existingProduct != null)
                        {
                            // Update existing
                            existingProduct.Title = $"{shopifyProduct.Title} — {variant.Title}";
                            existingProduct.Vendor = shopifyProduct.Vendor;
                            existingProduct.ProductType = shopifyProduct.ProductType;
                            existingProduct.Price = decimal.TryParse(variant.Price, out var price) ? price : 0;
                            existingProduct.ColorsJson = JsonSerializer.Serialize(colors);
                            existingProduct.SizesJson = JsonSerializer.Serialize(sizes);
                            existingProduct.TagsJson = JsonSerializer.Serialize(tags);
                            existingProduct.SearchableText = searchableText;
                            existingProduct.ImageUrl = shopifyProduct.Images.FirstOrDefault()?.Src;
                            existingProduct.Handle = shopifyProduct.Handle;
                            existingProduct.UpdatedAt = DateTime.UtcNow;
                            existingProduct.SyncedAt = DateTime.UtcNow;
                            existingProduct.HasEmbedding = false; // Invalidate embedding

                            updatedProducts++;
                        }
                        else
                        {
                            // Create new
                            var product = new Product
                            {
                                TenantId = tenantId,
                                ShopifyProductId = shopifyProduct.Id,
                                ShopifyVariantId = variant.Id,
                                Title = $"{shopifyProduct.Title} — {variant.Title}",
                                Vendor = shopifyProduct.Vendor,
                                ProductType = shopifyProduct.ProductType,
                                Price = decimal.TryParse(variant.Price, out var price) ? price : 0,
                                ColorsJson = JsonSerializer.Serialize(colors),
                                SizesJson = JsonSerializer.Serialize(sizes),
                                TagsJson = JsonSerializer.Serialize(tags),
                                SearchableText = searchableText,
                                ImageUrl = shopifyProduct.Images.FirstOrDefault()?.Src,
                                Handle = shopifyProduct.Handle,
                                HasEmbedding = false,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                SyncedAt = DateTime.UtcNow
                            };

                            _context.Products.Add(product);
                            newProducts++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to sync product {ProductId} variant {VariantId}",
                            shopifyProduct.Id, variant.Id);
                        failedProducts++;
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Update tenant stats
            tenant.ProductCount = await _context.Products.CountAsync(p => p.TenantId == tenantId);
            tenant.LastProductSync = DateTime.UtcNow;
            tenant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Product sync completed for tenant {TenantId}: {New} new, {Updated} updated, {Failed} failed",
                tenantId, newProducts, updatedProducts, failedProducts);

            return new SyncProductsResponse(
                true,
                tenant.ProductCount,
                newProducts,
                updatedProducts,
                failedProducts
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Product sync failed for tenant {TenantId}", tenantId);
            return new SyncProductsResponse(false, 0, 0, 0, 0, ex.Message);
        }
    }

    public async Task<GenerateEmbeddingsResponse> GenerateEmbeddingsAsync(int tenantId, bool forceRegenerate = false)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return new GenerateEmbeddingsResponse(false, 0, 0, 0, 0, "Tenant not found");
        }

        var config = await _context.RAGConfigurations.FirstOrDefaultAsync(r => r.TenantId == tenantId);
        if (config == null)
        {
            return new GenerateEmbeddingsResponse(false, 0, 0, 0, 0, "RAG configuration not found");
        }

        _logger.LogInformation("Starting embedding generation for tenant {TenantId}", tenantId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Get products that need embeddings
            var productsQuery = _context.Products.Where(p => p.TenantId == tenantId);

            if (!forceRegenerate)
            {
                productsQuery = productsQuery.Where(p => !p.HasEmbedding);
            }

            var products = await productsQuery.ToListAsync();

            if (products.Count == 0)
            {
                return new GenerateEmbeddingsResponse(true, 0, 0, 0, stopwatch.Elapsed.TotalSeconds,
                    "No products need embeddings");
            }

            // Call Python RAG API to generate embeddings
            var embeddingsGenerated = 0;
            var failedEmbeddings = 0;

            foreach (var product in products)
            {
                try
                {
                    var embedding = await _ragService.GenerateEmbeddingAsync(
                        tenantId,
                        product.SearchableText,
                        config
                    );

                    product.EmbeddingJson = JsonSerializer.Serialize(embedding);
                    product.HasEmbedding = true;
                    product.UpdatedAt = DateTime.UtcNow;

                    embeddingsGenerated++;

                    if (embeddingsGenerated % 100 == 0)
                    {
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Generated {Count} embeddings so far...", embeddingsGenerated);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate embedding for product {ProductId}", product.Id);
                    failedEmbeddings++;
                }
            }

            await _context.SaveChangesAsync();

            stopwatch.Stop();

            _logger.LogInformation(
                "Embedding generation completed for tenant {TenantId}: {Generated} generated, {Failed} failed in {Time}s",
                tenantId, embeddingsGenerated, failedEmbeddings, stopwatch.Elapsed.TotalSeconds);

            return new GenerateEmbeddingsResponse(
                true,
                products.Count,
                embeddingsGenerated,
                failedEmbeddings,
                stopwatch.Elapsed.TotalSeconds
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Embedding generation failed for tenant {TenantId}", tenantId);
            return new GenerateEmbeddingsResponse(
                false,
                0,
                0,
                0,
                stopwatch.Elapsed.TotalSeconds,
                ex.Message
            );
        }
    }

    // Helper methods
    private static string[] ExtractColors(ShopifyProduct product, ShopifyVariant variant)
    {
        var colors = new HashSet<string>();

        // Try to extract from variant options
        if (!string.IsNullOrEmpty(variant.Option1) && IsColor(variant.Option1))
            colors.Add(variant.Option1);
        if (!string.IsNullOrEmpty(variant.Option2) && IsColor(variant.Option2))
            colors.Add(variant.Option2);
        if (!string.IsNullOrEmpty(variant.Option3) && IsColor(variant.Option3))
            colors.Add(variant.Option3);

        return colors.ToArray();
    }

    private static string[] ExtractSizes(ShopifyProduct product, ShopifyVariant variant)
    {
        var sizes = new HashSet<string>();

        // Try to extract from variant options
        if (!string.IsNullOrEmpty(variant.Option1) && IsSize(variant.Option1))
            sizes.Add(variant.Option1);
        if (!string.IsNullOrEmpty(variant.Option2) && IsSize(variant.Option2))
            sizes.Add(variant.Option2);
        if (!string.IsNullOrEmpty(variant.Option3) && IsSize(variant.Option3))
            sizes.Add(variant.Option3);

        return sizes.ToArray();
    }

    private static bool IsColor(string value)
    {
        var colorKeywords = new[] { "black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "gray", "grey", "siyah", "beyaz", "kırmızı", "mavi", "yeşil", "sarı", "turuncu", "mor", "pembe", "kahverengi", "gri" };
        return colorKeywords.Any(c => value.Contains(c, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsSize(string value)
    {
        var sizePatterns = new[] { "XS", "S", "M", "L", "XL", "XXL", "XXXL" };
        return sizePatterns.Any(s => value.Equals(s, StringComparison.OrdinalIgnoreCase)) ||
               Regex.IsMatch(value, @"^\d+$"); // Numeric sizes
    }

    private static string BuildSearchableText(
        ShopifyProduct product,
        ShopifyVariant variant,
        string[] colors,
        string[] sizes,
        string[] tags)
    {
        var parts = new List<string>
        {
            product.Title,
            variant.Title,
            product.Vendor,
            product.ProductType,
            CleanHtml(product.BodyHtml ?? "")
        };

        if (colors.Length > 0)
            parts.Add($"Colors: {string.Join(", ", colors)}");

        if (sizes.Length > 0)
            parts.Add($"Sizes: {string.Join(", ", sizes)}");

        if (tags.Length > 0)
            parts.Add($"Tags: {string.Join(", ", tags)}");

        return string.Join(" | ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    private static string CleanHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        // Remove HTML tags
        var text = Regex.Replace(html, "<.*?>", " ");
        // Remove extra whitespace
        text = Regex.Replace(text, @"\s+", " ");
        return text.Trim();
    }
}
