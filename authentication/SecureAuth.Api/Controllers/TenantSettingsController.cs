using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId}/settings")]
[Authorize]
public class TenantSettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TenantSettingsController> _logger;

    public TenantSettingsController(AppDbContext context, ILogger<TenantSettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get tenant settings (User & Admin)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<TenantSettingsResponse>> GetSettings(int tenantId)
    {
        var settings = await _context.TenantSettings
            .FirstOrDefaultAsync(ts => ts.TenantId == tenantId);

        if (settings == null)
        {
            // Create default settings if not exists
            settings = await CreateDefaultSettings(tenantId);
        }

        return Ok(MapToResponse(settings));
    }

    /// <summary>
    /// Update tenant settings (User & Admin)
    /// Users can update appearance, Admins can update everything
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<TenantSettingsResponse>> UpdateSettings(
        int tenantId,
        [FromBody] UpdateTenantSettingsRequest request)
    {
        var settings = await _context.TenantSettings
            .FirstOrDefaultAsync(ts => ts.TenantId == tenantId);

        if (settings == null)
        {
            settings = await CreateDefaultSettings(tenantId);
        }

        // Update fields if provided
        if (request.BrandColorPrimary != null) settings.BrandColorPrimary = request.BrandColorPrimary;
        if (request.BrandColorSecondary != null) settings.BrandColorSecondary = request.BrandColorSecondary;
        if (request.WidgetPosition != null) settings.WidgetPosition = request.WidgetPosition;
        if (request.ChatTitle != null) settings.ChatTitle = request.ChatTitle;
        if (request.WelcomeMessage != null) settings.WelcomeMessage = request.WelcomeMessage;
        if (request.LogoUrl != null) settings.LogoUrl = request.LogoUrl;
        if (request.AvatarUrl != null) settings.AvatarUrl = request.AvatarUrl;
        if (request.AutoOpen.HasValue) settings.AutoOpen = request.AutoOpen.Value;
        if (request.AutoOpenDelaySeconds.HasValue) settings.AutoOpenDelaySeconds = request.AutoOpenDelaySeconds.Value;
        if (request.ShowTypingIndicator.HasValue) settings.ShowTypingIndicator = request.ShowTypingIndicator.Value;
        if (request.EnableSoundNotifications.HasValue) settings.EnableSoundNotifications = request.EnableSoundNotifications.Value;
        if (request.AllowedDomains != null) settings.AllowedDomains = request.AllowedDomains;
        if (request.RequireAuth.HasValue) settings.RequireAuth = request.RequireAuth.Value;
        if (request.WidgetSize != null) settings.WidgetSize = request.WidgetSize;
        if (request.Language != null) settings.Language = request.Language;
        if (request.Timezone != null) settings.Timezone = request.Timezone;
        if (request.CustomCss != null) settings.CustomCss = request.CustomCss;

        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tenant settings updated: TenantId={TenantId}", tenantId);

        return Ok(MapToResponse(settings));
    }

    /// <summary>
    /// Get public widget configuration by tenant slug (No auth required)
    /// </summary>
    [HttpGet("/api/widget/config/{tenantSlug}")]
    [AllowAnonymous]
    [EnableCors("widget")]
    public async Task<ActionResult<WidgetConfigResponse>> GetPublicWidgetConfig(string tenantSlug)
    {
        var tenant = await _context.Tenants
            .Include(t => t.Settings)
            .FirstOrDefaultAsync(t => t.Slug == tenantSlug && t.IsActive);

        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found or inactive" });
        }

        var settings = tenant.Settings;
        if (settings == null)
        {
            // Create default settings if not exist
            settings = await CreateDefaultSettings(tenant.Id);
        }

        var config = new WidgetConfigResponse(
            tenant.Id,
            tenant.Name,
            settings.BrandColorPrimary,
            settings.BrandColorSecondary,
            settings.WidgetPosition,
            settings.ChatTitle,
            settings.WelcomeMessage,
            settings.LogoUrl,
            settings.AvatarUrl,
            settings.AutoOpen,
            settings.AutoOpenDelaySeconds,
            settings.ShowTypingIndicator,
            settings.EnableSoundNotifications,
            settings.WidgetSize,
            settings.Language,
            settings.CustomCss
        );

        return Ok(config);
    }

    /// <summary>
    /// Get embed code for tenant (Admin only)
    /// </summary>
    [HttpGet("embed-code")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> GetEmbedCode(int tenantId)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var embedCode = $@"<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {{
    tenantSlug: '{tenant.Slug}',
    apiUrl: '{baseUrl}'
  }};
</script>
<script src=""{baseUrl}/widget/widget.js""></script>";

        return Ok(new
        {
            tenantSlug = tenant.Slug,
            embedCode = embedCode,
            instructions = "Copy and paste this code into your website's HTML, just before the closing </body> tag."
        });
    }

    private async Task<TenantSettings> CreateDefaultSettings(int tenantId)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new Exception("Tenant not found");
        }

        var settings = new TenantSettings
        {
            TenantId = tenantId,
            ChatTitle = $"{tenant.Name} Asistanı",
            WelcomeMessage = $"Merhaba! {tenant.Name} hakkında size nasıl yardımcı olabilirim?",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TenantSettings.Add(settings);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Default settings created for tenant: {TenantId}", tenantId);

        return settings;
    }

    private static TenantSettingsResponse MapToResponse(TenantSettings settings)
    {
        return new TenantSettingsResponse(
            settings.Id,
            settings.TenantId,
            settings.BrandColorPrimary,
            settings.BrandColorSecondary,
            settings.WidgetPosition,
            settings.ChatTitle,
            settings.WelcomeMessage,
            settings.LogoUrl,
            settings.AvatarUrl,
            settings.AutoOpen,
            settings.AutoOpenDelaySeconds,
            settings.ShowTypingIndicator,
            settings.EnableSoundNotifications,
            settings.AllowedDomains,
            settings.RequireAuth,
            settings.WidgetSize,
            settings.Language,
            settings.Timezone,
            settings.CustomCss,
            settings.CreatedAt,
            settings.UpdatedAt
        );
    }
}
