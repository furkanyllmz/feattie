using SecureAuth.Api.Models;

namespace SecureAuth.Api.DTOs;

public record CreateContextRequest(
    string Title,
    string Slug,
    string Content,
    string Type, // "GENERAL", "SHIPPING", "RETURNS", etc.
    string[]? TriggerKeywords = null,
    bool AlwaysInclude = false,
    int Priority = 0
);

public record UpdateContextRequest(
    string? Title = null,
    string? Content = null,
    string? Type = null,
    string[]? TriggerKeywords = null,
    bool? AlwaysInclude = null,
    int? Priority = null,
    bool? IsActive = null
);

public record ContextResponse(
    int Id,
    int TenantId,
    string Title,
    string Slug,
    string Content,
    string Type,
    string[] TriggerKeywords,
    bool AlwaysInclude,
    int Priority,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
