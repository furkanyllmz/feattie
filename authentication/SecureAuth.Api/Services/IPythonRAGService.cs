using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Services;

public interface IPythonRAGService
{
    /// <summary>
    /// Generate embedding for a single text
    /// </summary>
    Task<double[]> GenerateEmbeddingAsync(int tenantId, string text, RAGConfiguration config);

    /// <summary>
    /// Search products using RAG
    /// </summary>
    Task<RAGSearchResponse> SearchAsync(int tenantId, RAGSearchRequest request);

    /// <summary>
    /// Ask AI assistant
    /// </summary>
    Task<AskAssistantResponse> AskAsync(int tenantId, AskAssistantRequest request);
}
