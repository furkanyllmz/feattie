#!/usr/bin/env dotnet-script
#r "nuget: BCrypt.Net-Next, 4.0.3"

using BCrypt.Net;

// Admin kullanıcı bilgileri
var email = "admin@example.com";
var password = "admin123";
var role = 1; // ADMIN role

// BCrypt hash oluştur
var passwordHash = BCrypt.HashPassword(password);

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
