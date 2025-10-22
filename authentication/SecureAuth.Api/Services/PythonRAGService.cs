using System.Net.Http.Json;
using System.Text.Json;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Services;

public class PythonRAGService : IPythonRAGService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PythonRAGService> _logger;
    private readonly string _pythonApiBaseUrl;

    public PythonRAGService(HttpClient httpClient, IConfiguration configuration, ILogger<PythonRAGService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _pythonApiBaseUrl = configuration["PythonRAG:BaseUrl"] ?? "http://localhost:8000";
    }

    public async Task<double[]> GenerateEmbeddingAsync(int tenantId, string text, RAGConfiguration config)
    {
        try
        {
            var request = new
            {
                tenant_id = tenantId,
                text = text,
                embedding_provider = config.EmbeddingProvider.ToString().ToLower(),
                embedding_model = config.EmbeddingModel,
                openai_api_key = config.OpenAIApiKey
            };

            var response = await _httpClient.PostAsJsonAsync($"{_pythonApiBaseUrl}/embed", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<EmbeddingResponse>();
            return result?.Embedding ?? Array.Empty<double>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate embedding for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<RAGSearchResponse> SearchAsync(int tenantId, RAGSearchRequest request)
    {
        try
        {
            var requestBody = new
            {
                tenant_id = tenantId,
                query = request.Query,
                top_k = request.TopK,
                include_contexts = request.IncludeContexts
            };

            var response = await _httpClient.PostAsJsonAsync($"{_pythonApiBaseUrl}/search", requestBody);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<RAGSearchResponse>();
            return result ?? new RAGSearchResponse(request.Query, Array.Empty<ProductSearchResult>(), Array.Empty<string>(), 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<AskAssistantResponse> AskAsync(int tenantId, AskAssistantRequest request)
    {
        try
        {
            var requestBody = new
            {
                tenant_id = tenantId,
                query = request.Query,
                top_k = request.TopK,
                session_id = request.SessionId
            };

            var response = await _httpClient.PostAsJsonAsync($"{_pythonApiBaseUrl}/ask", requestBody);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<AskAssistantResponse>();
            return result ?? new AskAssistantResponse(
                request.Query,
                "Sorry, I couldn't process your request.",
                Array.Empty<ProductSearchResult>(),
                Array.Empty<string>(),
                request.SessionId,
                0
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ask assistant for tenant {TenantId}", tenantId);
            throw;
        }
    }

    private class EmbeddingResponse
    {
        public double[] Embedding { get; set; } = Array.Empty<double>();
    }
}
