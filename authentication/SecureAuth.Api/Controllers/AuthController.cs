using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration cfg) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { error = "email and password required" });

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "email already in use" });

        if (dto.Password.Length < 6)
            return BadRequest(new { error = "password must be at least 6 characters" });

        var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = new User { Email = email, PasswordHash = hash, Role = Role.USER };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Created("", new { user.Id, user.Email, role = (int)user.Role, user.CreatedAt });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = (dto.Email ?? "").Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { error = "invalid credentials" });

        if (!user.IsActive)
            return Unauthorized(new { error = "account deactivated" });

        // Ban check
        if (user.IsBanned)
        {
            if (user.BanExpires.HasValue && user.BanExpires.Value <= DateTime.UtcNow)
            {
                // Ban period expired, automatically remove
                user.IsBanned = false;
                user.BanReason = null;
                user.BanExpires = null;
                user.BannedAt = null;
                user.IsActive = true;
                await db.SaveChangesAsync();
            }
            else
            {
                var banMessage = user.BanExpires.HasValue 
                    ? $"Your account is banned until {user.BanExpires.Value:dd.MM.yyyy HH:mm}. Reason: {user.BanReason}"
                    : $"Your account is permanently banned. Reason: {user.BanReason}";
                return Unauthorized(new { error = banMessage });
            }
        }

        // Update last login time
        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var token = CreateJwt(user, cfg);
        SetJwtCookie(token, cfg);

        return Ok(new { user = new { user.Id, user.Email, role = (int)user.Role, user.FirstName, user.LastName } });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim is null || !int.TryParse(idClaim, out var uid))
            return Unauthorized();

        var me = await db.Users
            .Where(u => u.Id == uid)
            .Select(u => new { u.Id, u.Email, role = (int)u.Role, u.CreatedAt })
            .FirstAsync();

        return Ok(me);
    }

    [Authorize]
    [HttpGet("me/tenants")]
    public async Task<IActionResult> MyTenants()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim is null || !int.TryParse(idClaim, out var uid))
            return Unauthorized();

        var tenants = await db.TenantUsers
            .Where(tu => tu.UserId == uid)
            .Include(tu => tu.Tenant)
            .Select(tu => new
            {
                tu.Tenant.Id,
                tu.Tenant.Name,
                tu.Tenant.Slug,
                tu.Tenant.IsActive,
                tu.Tenant.ProductCount,
                tu.Tenant.LastProductSync,
                tu.Tenant.CreatedAt,
                role = tu.Role.ToString(),
                roleNumber = (int)tu.Role,
                joinedAt = tu.JoinedAt
            })
            .ToListAsync();

        return Ok(tenants);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/secret")]
    public IActionResult AdminSecret() => Ok(new { secret = "admin-only 🎩" });

    /// <summary>
    /// Assign user to tenant
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/users/{userId}/tenants/{tenantId}")]
    public async Task<IActionResult> AssignUserToTenant(int userId, int tenantId, [FromBody] AssignTenantRequest? request)
    {
        var user = await db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var tenant = await db.Tenants.FindAsync(tenantId);
        if (tenant == null)
            return NotFound(new { message = "Tenant not found" });

        // Check if already assigned
        var existing = await db.TenantUsers
            .FirstOrDefaultAsync(tu => tu.UserId == userId && tu.TenantId == tenantId);

        if (existing != null)
            return BadRequest(new { message = "User is already assigned to this tenant" });

        var tenantUser = new TenantUser
        {
            UserId = userId,
            TenantId = tenantId,
            Role = (TenantRole)(request?.Role ?? 0),
            JoinedAt = DateTime.UtcNow
        };

        db.TenantUsers.Add(tenantUser);
        await db.SaveChangesAsync();

        return Ok(new
        {
            id = tenantUser.Id,
            userId = tenantUser.UserId,
            tenantId = tenantUser.TenantId,
            role = tenantUser.Role.ToString(),
            joinedAt = tenantUser.JoinedAt
        });
    }

    /// <summary>
    /// Remove user from tenant
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("admin/users/{userId}/tenants/{tenantId}")]
    public async Task<IActionResult> RemoveUserFromTenant(int userId, int tenantId)
    {
        var tenantUser = await db.TenantUsers
            .FirstOrDefaultAsync(tu => tu.UserId == userId && tu.TenantId == tenantId);

        if (tenantUser == null)
            return NotFound(new { message = "User is not assigned to this tenant" });

        db.TenantUsers.Remove(tenantUser);
        await db.SaveChangesAsync();

        return Ok(new { message = "User removed from tenant successfully" });
    }

    /// <summary>
    /// Get user's tenant assignments
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/users/{userId}/tenants")]
    public async Task<IActionResult> GetUserTenants(int userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var tenants = await db.TenantUsers
            .Where(tu => tu.UserId == userId)
            .Include(tu => tu.Tenant)
            .Select(tu => new
            {
                tu.Tenant.Id,
                tu.Tenant.Name,
                tu.Tenant.Slug,
                tu.Tenant.IsActive,
                role = tu.Role.ToString(),
                roleNumber = (int)tu.Role,
                joinedAt = tu.JoinedAt
            })
            .ToListAsync();

        return Ok(tenants);
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        Response.Cookies.Delete("jwt", new CookieOptions { HttpOnly = true, Secure = !isDevelopment, SameSite = SameSiteMode.Strict });
        return Ok(new { ok = true });
    }

    // *** Password Management APIs ***
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user is null)
            return Ok(new { message = "If the email is registered, a reset link has been sent." });

        // Create reset token
        var resetToken = Guid.NewGuid().ToString();
        user.PasswordResetToken = resetToken;
        user.PasswordResetExpires = DateTime.UtcNow.AddHours(1); // Valid for 1 hour
        
        await db.SaveChangesAsync();
        
        // TODO: Email gönderme servisi buraya eklenecek
        // EmailService.SendPasswordReset(user.Email, resetToken);
        
        return Ok(new { message = "If the email is registered, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => 
            u.Email == email && 
            u.PasswordResetToken == dto.Token &&
            u.PasswordResetExpires > DateTime.UtcNow);

        if (user is null)
            return BadRequest(new { error = "Invalid or expired token" });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { error = "Password must be at least 6 characters" });

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpires = null;
        
        await db.SaveChangesAsync();
        
        return Ok(new { message = "Password successfully reset" });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim is null || !int.TryParse(idClaim, out var uid))
            return Unauthorized();

        var user = await db.Users.FindAsync(uid);
        if (user is null)
            return NotFound();

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { error = "Current password is incorrect" });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { error = "New password must be at least 6 characters" });

        // Save new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();
        
        return Ok(new { message = "Password successfully changed" });
    }

    // *** Profile Management APIs ***
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim is null || !int.TryParse(idClaim, out var uid))
            return Unauthorized();

        var user = await db.Users.FindAsync(uid);
        if (user is null)
            return NotFound();

        // Email change check
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var newEmail = dto.Email.Trim().ToLowerInvariant();
            if (newEmail != user.Email)
            {
                if (await db.Users.AnyAsync(u => u.Email == newEmail && u.Id != uid))
                    return Conflict(new { error = "This email is being used by another user" });
                
                user.Email = newEmail;
                user.EmailVerified = false; // Reset verification when email is changed
            }
        }

        // Update profile information
        if (dto.FirstName is not null) user.FirstName = dto.FirstName.Trim();
        if (dto.LastName is not null) user.LastName = dto.LastName.Trim();
        
        await db.SaveChangesAsync();
        
        return Ok(new { 
            user.Id, 
            user.Email, 
            user.FirstName, 
            user.LastName, 
            role = (int)user.Role,
            user.EmailVerified,
            user.CreatedAt 
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("admin/users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, UpdateUserRoleDto dto)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { error = "User not found" });

        if (!Enum.IsDefined(typeof(Role), dto.Role))
            return BadRequest(new { error = "Invalid role" });

        user.Role = (Role)dto.Role;
        await db.SaveChangesAsync();

        return Ok(new { 
            message = $"User role updated to {(Role)dto.Role}",
            user = new { user.Id, user.Email, role = (int)user.Role }
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/users/{id}/ban")]
    public async Task<IActionResult> BanUser(int id, BanUserDto dto)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { error = "User not found" });

        if (user.Role == Role.ADMIN)
            return BadRequest(new { error = "Admin users cannot be banned" });

        user.IsBanned = true;
        user.BanReason = dto.Reason;
        user.BannedAt = DateTime.UtcNow;
        user.BanExpires = dto.DurationDays > 0 ? DateTime.UtcNow.AddDays(dto.DurationDays) : null;
        user.IsActive = false;

        await db.SaveChangesAsync();

        var banDuration = dto.DurationDays > 0 ? $"{dto.DurationDays} days" : "permanent";
        return Ok(new { 
            message = $"User banned for {banDuration}",
            banExpires = user.BanExpires
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/users/{id}/unban")]
    public async Task<IActionResult> UnbanUser(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { error = "User not found" });

        user.IsBanned = false;
        user.BanReason = null;
        user.BanExpires = null;
        user.BannedAt = null;
        user.IsActive = true;

        await db.SaveChangesAsync();

        return Ok(new { message = "User ban removed" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalUsers = await db.Users.CountAsync();
        var activeUsers = await db.Users.CountAsync(u => u.IsActive);
        var bannedUsers = await db.Users.CountAsync(u => u.IsBanned);
        var adminUsers = await db.Users.CountAsync(u => u.Role == Role.ADMIN);
        var recentUsers = await db.Users
            .Where(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            .CountAsync();

        var todayLogins = await db.Users
            .CountAsync(u => u.LastLoginAt >= DateTime.UtcNow.Date);

        return Ok(new {
            totalUsers,
            activeUsers,
            bannedUsers,
            adminUsers,
            recentUsers, // Last 30 days
            todayLogins
        });
    }

    /// <summary>
    /// User List - Use to find User IDs
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        var query = db.Users.AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(u => 
                u.Email.ToLower().Contains(search) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(search)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new {
                ID = u.Id, // Capitalized for emphasis
                Email = u.Email,
                FullName = $"{u.FirstName} {u.LastName}".Trim(),
                Role = u.Role.ToString(),
                RoleNumber = (int)u.Role, // 0=USER, 1=ADMIN
                Status = u.IsBanned ? "🚫 BANNED" : (u.IsActive ? "✅ ACTIVE" : "⚪ INACTIVE"),
                IsBanned = u.IsBanned,
                BanReason = u.BanReason,
                BanExpires = u.BanExpires,
                LastLogin = u.LastLoginAt,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(new {
            message = "💡 Use the numbers in the ID column to test other admin APIs",
            users,
            pagination = new {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            },
            howToUse = new {
                roleChange = "PUT /admin/users/{ID}/role to change role",
                banUser = "POST /admin/users/{ID}/ban to ban",
                unbanUser = "POST /admin/users/{ID}/unban to remove ban"
            }
        });
    }

    private static string CreateJwt(User user, IConfiguration cfg)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, ((int)user.Role).ToString())
        };

        var token = new JwtSecurityToken(
            issuer: cfg["Jwt:Issuer"],
            audience: cfg["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(cfg["Jwt:ExpiresMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void SetJwtCookie(string token, IConfiguration cfg)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment, // HTTP için false, production'da true
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(int.Parse(cfg["Jwt:ExpiresMinutes"]!))
        });
    }
}
