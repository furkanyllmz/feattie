namespace SecureAuth.Api.Models;

/// <summary>
/// Optional: Chat conversation history for analytics and context retention
/// </summary>
public class ChatSession
{
    public int Id { get; set; }

    // Tenant association
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    // Session identification
    public string SessionId { get; set; } = Guid.NewGuid().ToString();

    // User identification (optional - can be anonymous)
    public string? UserFingerprint { get; set; } // Browser fingerprint or user ID

    // Session metadata
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public int MessageCount { get; set; } = 0;

    // Navigation
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

public class ChatMessage
{
    public int Id { get; set; }

    // Session association
    public int ChatSessionId { get; set; }
    public ChatSession ChatSession { get; set; } = default!;

    // Message data
    public MessageRole Role { get; set; }
    public string Content { get; set; } = default!;

    // RAG metadata (if applicable)
    public string? ProductIdsJson { get; set; } // Products referenced in response
    public string? ContextIdsJson { get; set; } // Context snippets used

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum MessageRole
{
    USER,
    ASSISTANT,
    SYSTEM
}
