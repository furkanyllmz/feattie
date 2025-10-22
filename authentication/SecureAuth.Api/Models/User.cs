namespace SecureAuth.Api.Models;

public enum Role { USER, ADMIN }

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public Role Role { get; set; } = Role.USER;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Profile info
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool EmailVerified { get; set; } = false;

    // Password reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpires { get; set; }

    // Email verification
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpires { get; set; }

    // Account status
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    // Ban system
    public bool IsBanned { get; set; } = false;
    public string? BanReason { get; set; }
    public DateTime? BanExpires { get; set; }
    public DateTime? BannedAt { get; set; }

    // Multi-tenant relationships
    public ICollection<TenantUser> TenantUsers { get; set; } = new List<TenantUser>();
}
