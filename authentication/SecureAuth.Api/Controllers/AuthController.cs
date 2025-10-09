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
            return BadRequest(new { error = "email ve password gerekli" });

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "email kullanımda" });

        if (dto.Password.Length < 6)
            return BadRequest(new { error = "şifre en az 6 karakter" });

        var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = new User { Email = email, PasswordHash = hash, Role = Role.USER };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Created("", new { user.Id, user.Email, user.Role, user.CreatedAt });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = (dto.Email ?? "").Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { error = "geçersiz kimlik" });

        if (!user.IsActive)
            return Unauthorized(new { error = "hesap deaktif" });

        // Ban kontrolü
        if (user.IsBanned)
        {
            if (user.BanExpires.HasValue && user.BanExpires.Value <= DateTime.UtcNow)
            {
                // Ban süresi dolmuş, otomatik kaldır
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
                    ? $"Hesabınız {user.BanExpires.Value:dd.MM.yyyy HH:mm} tarihine kadar yasaklı. Sebep: {user.BanReason}"
                    : $"Hesabınız kalıcı olarak yasaklandı. Sebep: {user.BanReason}";
                return Unauthorized(new { error = banMessage });
            }
        }

        // Son giriş zamanını güncelle
        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var token = CreateJwt(user, cfg);
        SetJwtCookie(token, cfg);

        return Ok(new { user = new { user.Id, user.Email, user.Role, user.FirstName, user.LastName } });
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
            .Select(u => new { u.Id, u.Email, u.Role, u.CreatedAt })
            .FirstAsync();

        return Ok(me);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/secret")]
    public IActionResult AdminSecret() => Ok(new { secret = "admin-only 🎩" });

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt", new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict });
        return Ok(new { ok = true });
    }

    // *** Şifre Yönetimi API'leri ***
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user is null)
            return Ok(new { message = "Eğer email kayıtlıysa, sıfırlama linki gönderildi." });

        // Reset token oluştur
        var resetToken = Guid.NewGuid().ToString();
        user.PasswordResetToken = resetToken;
        user.PasswordResetExpires = DateTime.UtcNow.AddHours(1); // 1 saat geçerli
        
        await db.SaveChangesAsync();
        
        // TODO: Email gönderme servisi buraya eklenecek
        // EmailService.SendPasswordReset(user.Email, resetToken);
        
        return Ok(new { message = "Eğer email kayıtlıysa, sıfırlama linki gönderildi." });
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
            return BadRequest(new { error = "Geçersiz veya süresi dolmuş token" });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { error = "Şifre en az 6 karakter olmalı" });

        // Şifreyi güncelle
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpires = null;
        
        await db.SaveChangesAsync();
        
        return Ok(new { message = "Şifre başarıyla sıfırlandı" });
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

        // Mevcut şifreyi doğrula
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { error = "Mevcut şifre yanlış" });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { error = "Yeni şifre en az 6 karakter olmalı" });

        // Yeni şifreyi kaydet
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();
        
        return Ok(new { message = "Şifre başarıyla değiştirildi" });
    }

    // *** Profil Yönetimi API'leri ***
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

        // Email değişikliği kontrolü
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var newEmail = dto.Email.Trim().ToLowerInvariant();
            if (newEmail != user.Email)
            {
                if (await db.Users.AnyAsync(u => u.Email == newEmail && u.Id != uid))
                    return Conflict(new { error = "Bu email başka kullanıcı tarafından kullanılıyor" });
                
                user.Email = newEmail;
                user.EmailVerified = false; // Email değiştirildiğinde doğrulama sıfırlanır
            }
        }

        // Profil bilgilerini güncelle
        if (dto.FirstName is not null) user.FirstName = dto.FirstName.Trim();
        if (dto.LastName is not null) user.LastName = dto.LastName.Trim();
        
        await db.SaveChangesAsync();
        
        return Ok(new { 
            user.Id, 
            user.Email, 
            user.FirstName, 
            user.LastName, 
            user.Role,
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
            return NotFound(new { error = "Kullanıcı bulunamadı" });

        if (!Enum.IsDefined(typeof(Role), dto.Role))
            return BadRequest(new { error = "Geçersiz rol" });

        user.Role = (Role)dto.Role;
        await db.SaveChangesAsync();

        return Ok(new { 
            message = $"Kullanıcı rolü {(Role)dto.Role} olarak güncellendi",
            user = new { user.Id, user.Email, user.Role }
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/users/{id}/ban")]
    public async Task<IActionResult> BanUser(int id, BanUserDto dto)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { error = "Kullanıcı bulunamadı" });

        if (user.Role == Role.ADMIN)
            return BadRequest(new { error = "Admin kullanıcılar yasaklanamaz" });

        user.IsBanned = true;
        user.BanReason = dto.Reason;
        user.BannedAt = DateTime.UtcNow;
        user.BanExpires = dto.DurationDays > 0 ? DateTime.UtcNow.AddDays(dto.DurationDays) : null;
        user.IsActive = false;

        await db.SaveChangesAsync();

        var banDuration = dto.DurationDays > 0 ? $"{dto.DurationDays} gün" : "kalıcı";
        return Ok(new { 
            message = $"Kullanıcı {banDuration} süreyle yasaklandı",
            banExpires = user.BanExpires
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/users/{id}/unban")]
    public async Task<IActionResult> UnbanUser(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { error = "Kullanıcı bulunamadı" });

        user.IsBanned = false;
        user.BanReason = null;
        user.BanExpires = null;
        user.BannedAt = null;
        user.IsActive = true;

        await db.SaveChangesAsync();

        return Ok(new { message = "Kullanıcı yasağı kaldırıldı" });
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
            recentUsers, // Son 30 gün
            todayLogins
        });
    }

    /// <summary>
    /// Kullanıcı Listesi - Kullanıcı ID'lerini bulmak için kullanın
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        var query = db.Users.AsQueryable();

        // Arama filtresi
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
                ID = u.Id, // Büyük harfle vurgulu
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
            message = "💡 ID sütunundaki sayıları kullanarak diğer admin API'lerini test edin",
            users,
            pagination = new {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            },
            howToUse = new {
                roleChange = "PUT /admin/users/{ID}/role ile rol değiştirin",
                banUser = "POST /admin/users/{ID}/ban ile yasaklayın",
                unbanUser = "POST /admin/users/{ID}/unban ile yasağı kaldırın"
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
            new Claim(ClaimTypes.Role, user.Role.ToString())
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
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,             // dev’de HTTPS yoksa geçici olarak false yapabilirsin
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(int.Parse(cfg["Jwt:ExpiresMinutes"]!))
        });
    }
}
