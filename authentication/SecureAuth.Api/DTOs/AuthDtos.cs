namespace SecureAuth.Api.DTOs;

public record RegisterDto(string Email, string Password);
public record LoginDto(string Email, string Password);

// Password management
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Email, string Token, string NewPassword);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

// Profil yönetimi
public record UpdateProfileDto(string? Email, string? FirstName, string? LastName);

// Admin yönetimi
public record UpdateUserRoleDto(int Role); // 0=USER, 1=ADMIN
public record BanUserDto(string Reason, int DurationDays);
public record GetUsersFilterDto(string? Search, int? Role, bool? IsActive, int Page = 1, int PageSize = 10);
