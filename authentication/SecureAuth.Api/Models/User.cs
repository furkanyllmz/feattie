namespace SecureAuth.Api.Models;

public enum Role { USER, ADMIN }

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public Role Role { get; set; } = Role.USER;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Profil bilgileri
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool EmailVerified { get; set; } = false;
    
    // Şifre sıfırlama
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpires { get; set; }
    
    // Email doğrulama
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpires { get; set; }
    
    // Hesap durumu
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    
    // Ban sistemi
    public bool IsBanned { get; set; } = false;
    public string? BanReason { get; set; }
    public DateTime? BanExpires { get; set; }
    public DateTime? BannedAt { get; set; }
}
