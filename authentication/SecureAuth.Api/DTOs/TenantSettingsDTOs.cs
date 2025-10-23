namespace SecureAuth.Api.DTOs;

/// <summary>
/// Response DTO for tenant settings
/// </summary>
public record TenantSettingsResponse(
    int Id,
    int TenantId,
    string BrandColorPrimary,
    string BrandColorSecondary,
    string WidgetPosition,
    string ChatTitle,
    string WelcomeMessage,
    string? LogoUrl,
    string? AvatarUrl,
    bool AutoOpen,
    int AutoOpenDelaySeconds,
    bool ShowTypingIndicator,
    bool EnableSoundNotifications,
    string[] AllowedDomains,
    bool RequireAuth,
    string WidgetSize,
    string Language,
    string Timezone,
    string? CustomCss,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Request DTO for creating/updating tenant settings
/// </summary>
public record UpdateTenantSettingsRequest(
    string? BrandColorPrimary,
    string? BrandColorSecondary,
    string? WidgetPosition,
    string? ChatTitle,
    string? WelcomeMessage,
    string? LogoUrl,
    string? AvatarUrl,
    bool? AutoOpen,
    int? AutoOpenDelaySeconds,
    bool? ShowTypingIndicator,
    bool? EnableSoundNotifications,
    string[]? AllowedDomains,
    bool? RequireAuth,
    string? WidgetSize,
    string? Language,
    string? Timezone,
    string? CustomCss
);

/// <summary>
/// Public widget configuration (no sensitive data)
/// Used by the embeddable widget
/// </summary>
public record WidgetConfigResponse(
    int TenantId,
    string TenantName,
    string BrandColorPrimary,
    string BrandColorSecondary,
    string WidgetPosition,
    string ChatTitle,
    string WelcomeMessage,
    string? LogoUrl,
    string? AvatarUrl,
    bool AutoOpen,
    int AutoOpenDelaySeconds,
    bool ShowTypingIndicator,
    bool EnableSoundNotifications,
    string WidgetSize,
    string Language,
    string? CustomCss
);
