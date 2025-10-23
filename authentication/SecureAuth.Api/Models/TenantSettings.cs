namespace SecureAuth.Api.Models;

/// <summary>
/// Tenant-specific customization settings for chat widget
/// </summary>
public class TenantSettings
{
    public int Id { get; set; }

    // Foreign key to Tenant
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    // Branding & Appearance
    public string BrandColorPrimary { get; set; } = "#667eea";
    public string BrandColorSecondary { get; set; } = "#764ba2";
    public string WidgetPosition { get; set; } = "bottom-right"; // bottom-right, bottom-left, top-right, top-left
    public string ChatTitle { get; set; } = "Chat Asistanı";
    public string WelcomeMessage { get; set; } = "Merhaba! Size nasıl yardımcı olabilirim?";
    public string? LogoUrl { get; set; }
    public string? AvatarUrl { get; set; }

    // Widget Behavior
    public bool AutoOpen { get; set; } = false;
    public int AutoOpenDelaySeconds { get; set; } = 3;
    public bool ShowTypingIndicator { get; set; } = true;
    public bool EnableSoundNotifications { get; set; } = true;

    // Security & Access
    public string[] AllowedDomains { get; set; } = Array.Empty<string>(); // CORS whitelist
    public bool RequireAuth { get; set; } = false; // Require user login for chat

    // Display Settings
    public string WidgetSize { get; set; } = "medium"; // small, medium, large
    public string Language { get; set; } = "tr";
    public string Timezone { get; set; } = "Europe/Istanbul";

    // Custom CSS (Advanced)
    public string? CustomCss { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Widget position options
/// </summary>
public enum WidgetPosition
{
    BottomRight,
    BottomLeft,
    TopRight,
    TopLeft
}

/// <summary>
/// Widget size options
/// </summary>
public enum WidgetSize
{
    Small,
    Medium,
    Large
}
