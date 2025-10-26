using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        // Admin kullanıcı bilgileri
        var email = "admin@example.com";
        var password = "admin123";
        var role = 1; // ADMIN role

        // BCrypt hash oluştur
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        Console.WriteLine($"Email: {email}");
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"Password Hash: {passwordHash}");
        Console.WriteLine($"Role: {role} (ADMIN)");
        Console.WriteLine();
        Console.WriteLine("SQL Query:");
        Console.WriteLine($@"
INSERT INTO ""Users""
(""Email"", ""PasswordHash"", ""Role"", ""CreatedAt"", ""FirstName"", ""LastName"", ""EmailVerified"", ""IsActive"", ""IsBanned"")
VALUES
('{email}', '{passwordHash}', {role}, NOW(), 'Admin', 'User', true, true, false)
ON CONFLICT (""Email"") DO UPDATE SET
  ""PasswordHash"" = EXCLUDED.""PasswordHash"",
  ""Role"" = EXCLUDED.""Role"";
");
    }
}
