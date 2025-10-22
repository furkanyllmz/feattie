using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId}/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ContextController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ContextController> _logger;

    public ContextController(AppDbContext context, ILogger<ContextController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all contexts for a tenant
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContextResponse>>> GetContexts(
        int tenantId,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? type = null)
    {
        if (!await TenantExists(tenantId))
        {
            return NotFound(new { message = "Tenant not found" });
        }

        var query = _context.Contexts.Where(c => c.TenantId == tenantId);

        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ContextType>(type, out var contextType))
        {
            query = query.Where(c => c.Type == contextType);
        }

        var contexts = await query
            .OrderByDescending(c => c.Priority)
            .ThenByDescending(c => c.CreatedAt)
            .Select(c => MapToContextResponse(c))
            .ToListAsync();

        return Ok(contexts);
    }

    /// <summary>
    /// Get context by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ContextResponse>> GetContext(int tenantId, int id)
    {
        var context = await _context.Contexts
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        if (context == null)
        {
            return NotFound(new { message = "Context not found" });
        }

        return Ok(MapToContextResponse(context));
    }

    /// <summary>
    /// Get context by slug
    /// </summary>
    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<ContextResponse>> GetContextBySlug(int tenantId, string slug)
    {
        var context = await _context.Contexts
            .FirstOrDefaultAsync(c => c.Slug == slug && c.TenantId == tenantId);

        if (context == null)
        {
            return NotFound(new { message = "Context not found" });
        }

        return Ok(MapToContextResponse(context));
    }

    /// <summary>
    /// Create new context
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContextResponse>> CreateContext(
        int tenantId,
        [FromBody] CreateContextRequest request)
    {
        if (!await TenantExists(tenantId))
        {
            return NotFound(new { message = "Tenant not found" });
        }

        // Check if slug already exists for this tenant
        if (await _context.Contexts.AnyAsync(c => c.TenantId == tenantId && c.Slug == request.Slug))
        {
            return BadRequest(new { message = "Context with this slug already exists" });
        }

        if (!Enum.TryParse<ContextType>(request.Type, out var contextType))
        {
            return BadRequest(new { message = "Invalid context type" });
        }

        var context = new Context
        {
            TenantId = tenantId,
            Title = request.Title,
            Slug = request.Slug,
            Content = request.Content,
            Type = contextType,
            TriggerKeywords = request.TriggerKeywords ?? Array.Empty<string>(),
            AlwaysInclude = request.AlwaysInclude,
            Priority = request.Priority,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Contexts.Add(context);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Context created: {ContextId} - {ContextTitle} for tenant {TenantId}",
            context.Id, context.Title, tenantId);

        return CreatedAtAction(
            nameof(GetContext),
            new { tenantId, id = context.Id },
            MapToContextResponse(context)
        );
    }

    /// <summary>
    /// Update context
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ContextResponse>> UpdateContext(
        int tenantId,
        int id,
        [FromBody] UpdateContextRequest request)
    {
        var context = await _context.Contexts
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        if (context == null)
        {
            return NotFound(new { message = "Context not found" });
        }

        if (request.Title != null) context.Title = request.Title;
        if (request.Content != null) context.Content = request.Content;
        if (request.Type != null && Enum.TryParse<ContextType>(request.Type, out var contextType))
        {
            context.Type = contextType;
        }
        if (request.TriggerKeywords != null) context.TriggerKeywords = request.TriggerKeywords;
        if (request.AlwaysInclude.HasValue) context.AlwaysInclude = request.AlwaysInclude.Value;
        if (request.Priority.HasValue) context.Priority = request.Priority.Value;
        if (request.IsActive.HasValue) context.IsActive = request.IsActive.Value;

        context.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Context updated: {ContextId} for tenant {TenantId}", id, tenantId);

        return Ok(MapToContextResponse(context));
    }

    /// <summary>
    /// Delete context
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContext(int tenantId, int id)
    {
        var context = await _context.Contexts
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        if (context == null)
        {
            return NotFound(new { message = "Context not found" });
        }

        _context.Contexts.Remove(context);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Context deleted: {ContextId} from tenant {TenantId}", id, tenantId);

        return NoContent();
    }

    /// <summary>
    /// Get contexts that should be injected for a query
    /// </summary>
    [HttpPost("match")]
    [AllowAnonymous] // Public endpoint for RAG system
    public async Task<ActionResult<IEnumerable<ContextResponse>>> MatchContexts(
        int tenantId,
        [FromBody] RAGSearchRequest request)
    {
        var contexts = await _context.Contexts
            .Where(c => c.TenantId == tenantId && c.IsActive)
            .OrderByDescending(c => c.Priority)
            .ToListAsync();

        var matchedContexts = contexts
            .Where(c =>
                c.AlwaysInclude ||
                c.TriggerKeywords.Any(kw =>
                    request.Query.Contains(kw, StringComparison.OrdinalIgnoreCase)
                )
            )
            .Select(MapToContextResponse)
            .ToList();

        return Ok(matchedContexts);
    }

    // Helper methods
    private async Task<bool> TenantExists(int tenantId)
    {
        return await _context.Tenants.AnyAsync(t => t.Id == tenantId);
    }

    private static ContextResponse MapToContextResponse(Context context)
    {
        return new ContextResponse(
            context.Id,
            context.TenantId,
            context.Title,
            context.Slug,
            context.Content,
            context.Type.ToString(),
            context.TriggerKeywords,
            context.AlwaysInclude,
            context.Priority,
            context.IsActive,
            context.CreatedAt,
            context.UpdatedAt
        );
    }
}
