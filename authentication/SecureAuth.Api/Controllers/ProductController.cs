using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Services;
using System.Text.Json;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId}/products")]
[Authorize(Policy = "AdminOnly")]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IProductService _productService;
    private readonly ILogger<ProductController> _logger;

    public ProductController(
        AppDbContext context,
        IProductService productService,
        ILogger<ProductController> logger)
    {
        _context = context;
        _productService = productService;
        _logger = logger;
    }

    /// <summary>
    /// Get all products for a tenant
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProducts(
        int tenantId,
        [FromQuery] bool? hasEmbedding = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.Products.Where(p => p.TenantId == tenantId);

        if (hasEmbedding.HasValue)
        {
            query = query.Where(p => p.HasEmbedding == hasEmbedding.Value);
        }

        var productList = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var products = productList.Select(p => new ProductResponse(
            p.Id,
            p.ShopifyProductId,
            p.ShopifyVariantId,
            p.Title,
            p.Vendor,
            p.ProductType,
            p.Price,
            JsonSerializer.Deserialize<string[]>(p.ColorsJson) ?? Array.Empty<string>(),
            JsonSerializer.Deserialize<string[]>(p.SizesJson) ?? Array.Empty<string>(),
            JsonSerializer.Deserialize<string[]>(p.TagsJson) ?? Array.Empty<string>(),
            p.HasEmbedding,
            p.ImageUrl,
            p.Handle,
            p.SyncedAt ?? p.CreatedAt
        )).ToList();

        return Ok(products);
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetProduct(int tenantId, int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(new ProductResponse(
            product.Id,
            product.ShopifyProductId,
            product.ShopifyVariantId,
            product.Title,
            product.Vendor,
            product.ProductType,
            product.Price,
            JsonSerializer.Deserialize<string[]>(product.ColorsJson) ?? Array.Empty<string>(),
            JsonSerializer.Deserialize<string[]>(product.SizesJson) ?? Array.Empty<string>(),
            JsonSerializer.Deserialize<string[]>(product.TagsJson) ?? Array.Empty<string>(),
            product.HasEmbedding,
            product.ImageUrl,
            product.Handle,
            product.SyncedAt ?? product.CreatedAt
        ));
    }

    /// <summary>
    /// Sync products from Shopify
    /// </summary>
    [HttpPost("sync")]
    public async Task<ActionResult<SyncProductsResponse>> SyncProducts(
        int tenantId,
        [FromBody] SyncProductsRequest request)
    {
        _logger.LogInformation("Starting product sync for tenant {TenantId}", tenantId);

        var result = await _productService.SyncProductsAsync(tenantId, request.ForceResync);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Generate embeddings for products
    /// </summary>
    [HttpPost("generate-embeddings")]
    public async Task<ActionResult<GenerateEmbeddingsResponse>> GenerateEmbeddings(
        int tenantId,
        [FromBody] GenerateEmbeddingsRequest request)
    {
        _logger.LogInformation("Starting embedding generation for tenant {TenantId}", tenantId);

        var result = await _productService.GenerateEmbeddingsAsync(tenantId, request.ForceRegenerate);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete all products for tenant
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> DeleteAllProducts(int tenantId)
    {
        var products = await _context.Products
            .Where(p => p.TenantId == tenantId)
            .ToListAsync();

        _context.Products.RemoveRange(products);
        await _context.SaveChangesAsync();

        // Update tenant stats
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant != null)
        {
            tenant.ProductCount = 0;
            tenant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Deleted {Count} products for tenant {TenantId}", products.Count, tenantId);

        return NoContent();
    }

    /// <summary>
    /// Get product statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetProductStats(int tenantId)
    {
        var stats = new
        {
            TotalProducts = await _context.Products.CountAsync(p => p.TenantId == tenantId),
            ProductsWithEmbeddings = await _context.Products.CountAsync(p => p.TenantId == tenantId && p.HasEmbedding),
            ProductsWithoutEmbeddings = await _context.Products.CountAsync(p => p.TenantId == tenantId && !p.HasEmbedding),
            UniqueVendors = await _context.Products
                .Where(p => p.TenantId == tenantId)
                .Select(p => p.Vendor)
                .Distinct()
                .CountAsync(),
            UniqueProductTypes = await _context.Products
                .Where(p => p.TenantId == tenantId)
                .Select(p => p.ProductType)
                .Distinct()
                .CountAsync(),
            AveragePrice = await _context.Products
                .Where(p => p.TenantId == tenantId)
                .AverageAsync(p => (double?)p.Price) ?? 0,
            LastSyncedAt = await _context.Products
                .Where(p => p.TenantId == tenantId)
                .MaxAsync(p => (DateTime?)p.SyncedAt)
        };

        return Ok(stats);
    }
}
