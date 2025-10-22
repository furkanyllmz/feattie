using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;
using System.Text.Json;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class TenantController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TenantController> _logger;
    private readonly IConfiguration _configuration;

    public TenantController(AppDbContext context, ILogger<TenantController> logger, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Get all tenants (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TenantListItemResponse>>> GetTenants(
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Tenants.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var tenants = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TenantListItemResponse(
                t.Id,
                t.Name,
                t.Slug,
                t.IsActive,
                t.ProductCount,
                t.LastProductSync,
                t.CreatedAt
            ))
            .ToListAsync();

        return Ok(tenants);
    }

    /// <summary>
    /// Get tenant by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TenantResponse>> GetTenant(int id)
    {
        var tenant = await _context.Tenants
            .Include(t => t.RAGConfiguration)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        return Ok(MapToTenantResponse(tenant));
    }

    /// <summary>
    /// Get tenant by slug
    /// </summary>
    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<TenantResponse>> GetTenantBySlug(string slug)
    {
        var tenant = await _context.Tenants
            .Include(t => t.RAGConfiguration)
            .FirstOrDefaultAsync(t => t.Slug == slug);

        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        return Ok(MapToTenantResponse(tenant));
    }

    /// <summary>
    /// Create new tenant
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TenantResponse>> CreateTenant([FromBody] CreateTenantRequest request)
    {
        // Check if slug already exists
        if (await _context.Tenants.AnyAsync(t => t.Slug == request.Slug))
        {
            return BadRequest(new { message = "Slug already exists" });
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Slug = request.Slug,
            ShopifyStoreUrl = request.ShopifyStoreUrl,
            ShopifyAccessToken = request.ShopifyAccessToken,
            MaxProducts = request.MaxProducts,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        // Create default RAG configuration for new tenant
        var ragConfig = new RAGConfiguration
        {
            TenantId = tenant.Id,
            EmbeddingProvider = EmbeddingProvider.LOCAL,
            EmbeddingModel = "intfloat/multilingual-e5-large",
            MinimumSimilarityScore = 0.3,
            DefaultTopK = 5,
            EnableContextInjection = true,
            EnableConversationHistory = true,
            DeduplicateResults = true,
            Language = "tr",
            SystemPrompt = $"Sen bir e-ticaret alışveriş asistanısın. Müşteri ihtiyaçlarını anla ve {tenant.Name} mağazasından uygun ürünleri öner.",
            LLMProvider = LLMProvider.OPENAI,
            LLMModel = "gpt-4o-mini",
            LLMApiKey = _configuration["OpenAI:ApiKey"] ?? "",
            LLMTemperature = 0.7,
            LLMMaxTokens = 500,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.RAGConfigurations.Add(ragConfig);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tenant created with default RAG config: {TenantId} - {TenantName}", tenant.Id, tenant.Name);

        return CreatedAtAction(
            nameof(GetTenant),
            new { id = tenant.Id },
            MapToTenantResponse(tenant)
        );
    }

    /// <summary>
    /// Update tenant
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TenantResponse>> UpdateTenant(int id, [FromBody] UpdateTenantRequest request)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        if (request.Name != null) tenant.Name = request.Name;
        if (request.ShopifyStoreUrl != null) tenant.ShopifyStoreUrl = request.ShopifyStoreUrl;
        if (request.ShopifyAccessToken != null) tenant.ShopifyAccessToken = request.ShopifyAccessToken;
        if (request.IsActive.HasValue) tenant.IsActive = request.IsActive.Value;
        if (request.MaxProducts.HasValue) tenant.MaxProducts = request.MaxProducts.Value;

        tenant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tenant updated: {TenantId}", tenant.Id);

        return Ok(MapToTenantResponse(tenant));
    }

    /// <summary>
    /// Delete tenant (soft delete - sets IsActive = false)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTenant(int id, [FromQuery] bool permanent = false)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        if (permanent)
        {
            _context.Tenants.Remove(tenant);
            _logger.LogWarning("Tenant permanently deleted: {TenantId}", tenant.Id);
        }
        else
        {
            tenant.IsActive = false;
            tenant.UpdatedAt = DateTime.UtcNow;
            _logger.LogInformation("Tenant deactivated: {TenantId}", tenant.Id);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get tenant users
    /// </summary>
    [HttpGet("{id}/users")]
    public async Task<ActionResult<IEnumerable<TenantUserResponse>>> GetTenantUsers(int id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        var tenantUsers = await _context.TenantUsers
            .Include(tu => tu.User)
            .Where(tu => tu.TenantId == id)
            .Select(tu => new TenantUserResponse(
                tu.Id,
                tu.UserId,
                tu.User.Email,
                tu.User.FirstName != null && tu.User.LastName != null
                    ? $"{tu.User.FirstName} {tu.User.LastName}"
                    : null,
                tu.Role.ToString(),
                tu.JoinedAt
            ))
            .ToListAsync();

        return Ok(tenantUsers);
    }

    /// <summary>
    /// Add user to tenant
    /// </summary>
    [HttpPost("{id}/users")]
    public async Task<ActionResult<TenantUserResponse>> AddUserToTenant(
        int id,
        [FromBody] AddUserToTenantRequest request)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Check if user is already in tenant
        if (await _context.TenantUsers.AnyAsync(tu => tu.TenantId == id && tu.UserId == request.UserId))
        {
            return BadRequest(new { message = "User already in tenant" });
        }

        if (!Enum.TryParse<TenantRole>(request.Role, out var role))
        {
            return BadRequest(new { message = "Invalid role" });
        }

        var tenantUser = new TenantUser
        {
            TenantId = id,
            UserId = request.UserId,
            Role = role,
            JoinedAt = DateTime.UtcNow
        };

        _context.TenantUsers.Add(tenantUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} added to tenant {TenantId} with role {Role}",
            request.UserId, id, request.Role);

        return Ok(new TenantUserResponse(
            tenantUser.Id,
            user.Id,
            user.Email,
            user.FirstName != null && user.LastName != null ? $"{user.FirstName} {user.LastName}" : null,
            role.ToString(),
            tenantUser.JoinedAt
        ));
    }

    /// <summary>
    /// Remove user from tenant
    /// </summary>
    [HttpDelete("{tenantId}/users/{userId}")]
    public async Task<IActionResult> RemoveUserFromTenant(int tenantId, int userId)
    {
        var tenantUser = await _context.TenantUsers
            .FirstOrDefaultAsync(tu => tu.TenantId == tenantId && tu.UserId == userId);

        if (tenantUser == null)
        {
            return NotFound(new { message = "User not in tenant" });
        }

        _context.TenantUsers.Remove(tenantUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} removed from tenant {TenantId}", userId, tenantId);

        return NoContent();
    }

    /// <summary>
    /// Get tenant statistics
    /// </summary>
    [HttpGet("{id}/stats")]
    public async Task<ActionResult> GetTenantStats(int id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        var stats = new
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            ProductCount = await _context.Products.CountAsync(p => p.TenantId == id),
            ProductsWithEmbeddings = await _context.Products.CountAsync(p => p.TenantId == id && p.HasEmbedding),
            ContextCount = await _context.Contexts.CountAsync(c => c.TenantId == id),
            ActiveContexts = await _context.Contexts.CountAsync(c => c.TenantId == id && c.IsActive),
            UserCount = await _context.TenantUsers.CountAsync(tu => tu.TenantId == id),
            ChatSessionCount = await _context.ChatSessions.CountAsync(cs => cs.TenantId == id),
            TotalMessages = await _context.ChatMessages
                .Where(cm => cm.ChatSession.TenantId == id)
                .CountAsync(),
            HasRAGConfiguration = await _context.RAGConfigurations.AnyAsync(r => r.TenantId == id),
            LastProductSync = tenant.LastProductSync,
            CreatedAt = tenant.CreatedAt
        };

        return Ok(stats);
    }

    // Helper methods
    private static TenantResponse MapToTenantResponse(Tenant tenant)
    {
        return new TenantResponse(
            tenant.Id,
            tenant.Name,
            tenant.Slug,
            tenant.ShopifyStoreUrl,
            tenant.IsActive,
            tenant.SubscriptionExpires,
            tenant.MaxProducts,
            tenant.ProductCount,
            tenant.LastProductSync,
            tenant.CreatedAt,
            tenant.UpdatedAt,
            tenant.RAGConfiguration != null
        );
    }
}
