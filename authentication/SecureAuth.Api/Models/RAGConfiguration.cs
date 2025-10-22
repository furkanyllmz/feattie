namespace SecureAuth.Api.Models;

/// <summary>
/// RAG configuration for each tenant
/// Controls embedding model, LLM settings, and search parameters
/// </summary>
public class RAGConfiguration
{
    public int Id { get; set; }

    // Tenant association (one-to-one)
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    // Embedding configuration
    public EmbeddingProvider EmbeddingProvider { get; set; } = EmbeddingProvider.LOCAL;
    public string EmbeddingModel { get; set; } = "intfloat/multilingual-e5-large";

    // OpenAI configuration (if provider is OPENAI)
    public string? OpenAIApiKey { get; set; } // Encrypted in production
    public string? OpenAIEmbeddingModel { get; set; } = "text-embedding-3-large";

    // LLM configuration
    public LLMProvider LLMProvider { get; set; } = LLMProvider.OPENAI;
    public string LLMModel { get; set; } = "gpt-4o-mini";
    public string? LLMApiKey { get; set; } // Encrypted in production
    public double LLMTemperature { get; set; } = 0.7;
    public int LLMMaxTokens { get; set; } = 500;

    // Search configuration
    public int DefaultTopK { get; set; } = 3;
    public bool DeduplicateResults { get; set; } = true;
    public double MinimumSimilarityScore { get; set; } = 0.5; // Filter low-quality results

    // Language & Localization
    public string Language { get; set; } = "tr"; // tr, en, etc.
    public string SystemPrompt { get; set; } = "Sen bir e-ticaret alışveriş asistanısın. Müşteri ihtiyaçlarını anla ve uygun ürünleri öner.";

    // Feature flags
    public bool EnableContextInjection { get; set; } = true; // Use custom context
    public bool EnableConversationHistory { get; set; } = false; // Store chat history

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum EmbeddingProvider
{
    LOCAL,      // sentence-transformers
    OPENAI,     // OpenAI embeddings
    COHERE,     // Cohere embeddings (future)
    HUGGINGFACE // HuggingFace API (future)
}

public enum LLMProvider
{
    OPENAI,     // GPT-4, GPT-3.5
    ANTHROPIC,  // Claude (future)
    COHERE,     // Cohere (future)
    LOCAL       // Local LLM (future)
}
