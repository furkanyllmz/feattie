namespace SecureAuth.Api.DTOs;

public record CreateRAGConfigurationRequest(
    string EmbeddingProvider = "LOCAL", // "LOCAL", "OPENAI", "COHERE", "HUGGINGFACE"
    string EmbeddingModel = "intfloat/multilingual-e5-large",
    string? OpenAIApiKey = null, // Will be set from environment or user input
    string? OpenAIEmbeddingModel = "text-embedding-3-large",
    string LLMProvider = "OPENAI",
    string LLMModel = "gpt-4o-mini",
    string? LLMApiKey = null, // Will be set from environment or user input
    double LLMTemperature = 0.7,
    int LLMMaxTokens = 500,
    int DefaultTopK = 3,
    bool DeduplicateResults = true,
    double MinimumSimilarityScore = 0.5,
    string Language = "tr",
    string SystemPrompt = "Sen bir e-ticaret alışveriş asistanısın. Müşteri ihtiyaçlarını anla ve uygun ürünleri öner.",
    bool EnableContextInjection = true,
    bool EnableConversationHistory = false
);

public record UpdateRAGConfigurationRequest(
    string? EmbeddingProvider = null,
    string? EmbeddingModel = null,
    string? OpenAIApiKey = null,
    string? OpenAIEmbeddingModel = null,
    string? LLMProvider = null,
    string? LLMModel = null,
    string? LLMApiKey = null,
    double? LLMTemperature = null,
    int? LLMMaxTokens = null,
    int? DefaultTopK = null,
    bool? DeduplicateResults = null,
    double? MinimumSimilarityScore = null,
    string? Language = null,
    string? SystemPrompt = null,
    bool? EnableContextInjection = null,
    bool? EnableConversationHistory = null
);

public record RAGConfigurationResponse(
    int Id,
    int TenantId,
    string EmbeddingProvider,
    string EmbeddingModel,
    bool HasOpenAIApiKey,
    string? OpenAIEmbeddingModel,
    string LLMProvider,
    string LLMModel,
    bool HasLLMApiKey,
    double LLMTemperature,
    int LLMMaxTokens,
    int DefaultTopK,
    bool DeduplicateResults,
    double MinimumSimilarityScore,
    string Language,
    string SystemPrompt,
    bool EnableContextInjection,
    bool EnableConversationHistory,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// === EMBEDDING GENERATION DTOs ===

public record GenerateEmbeddingsRequest(
    bool ForceRegenerate = false,
    int BatchSize = 32
);

public record GenerateEmbeddingsResponse(
    bool Success,
    int TotalProducts,
    int EmbeddingsGenerated,
    int FailedEmbeddings,
    double TimeElapsedSeconds,
    string? ErrorMessage = null
);

// === RAG SEARCH DTOs ===

public record RAGSearchRequest(
    string Query,
    int TopK = 3,
    bool IncludeContexts = true
);

public record RAGSearchResponse(
    string Query,
    ProductSearchResult[] Products,
    string[] ContextsUsed,
    double SearchTimeMs
);

public record ProductSearchResult(
    int ProductId,
    long ShopifyProductId,
    long ShopifyVariantId,
    string Title,
    string Vendor,
    decimal Price,
    string[] Colors,
    string[] Sizes,
    double SimilarityScore,
    string? ImageUrl,
    string? Handle
);

// === AI ASSISTANT DTOs ===

public record AskAssistantRequest(
    string Query,
    int TopK = 3,
    string? SessionId = null
);

public record AskAssistantResponse(
    string Query,
    string Response,
    ProductSearchResult[] ProductsReferenced,
    string[] ContextsUsed,
    string? SessionId,
    double TotalTimeMs
);
