using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.Models;
using SecureAuth.Api.Services;
using System.Diagnostics;
using System.Text.Json;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPythonRAGService _ragService;
    private readonly ILogger<ChatController> _logger;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public ChatController(
        AppDbContext context,
        IPythonRAGService ragService,
        ILogger<ChatController> logger,
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _context = context;
        _ragService = ragService;
        _logger = logger;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    /// <summary>
    /// Send a chat message and get AI response
    /// Public endpoint for chat widget (no auth required)
    /// </summary>
    [HttpPost("{tenantId}")]
    [AllowAnonymous]
    [EnableCors("widget")]
    public async Task<ActionResult> SendMessage(
        int tenantId,
        [FromBody] ChatRequest request)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Validate tenant
            var tenant = await _context.Tenants
                .Include(t => t.RAGConfiguration)
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive);

            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found or inactive" });
            }

            if (tenant.RAGConfiguration == null)
            {
                return BadRequest(new { message = "RAG configuration not found for this tenant" });
            }

            // Get or create chat session
            ChatSession? session = null;
            if (!string.IsNullOrEmpty(request.SessionId))
            {
                session = await _context.ChatSessions
                    .Include(s => s.Messages)
                    .FirstOrDefaultAsync(s => s.SessionId == request.SessionId && s.TenantId == tenantId);
            }

            if (session == null)
            {
                session = new ChatSession
                {
                    TenantId = tenantId,
                    SessionId = request.SessionId ?? Guid.NewGuid().ToString(),
                    UserFingerprint = request.UserFingerprint,
                    StartedAt = DateTime.UtcNow,
                    MessageCount = 0
                };
                _context.ChatSessions.Add(session);
                await _context.SaveChangesAsync();
            }

            // Save user message
            var userMessage = new ChatMessage
            {
                ChatSessionId = session.Id,
                Role = MessageRole.USER,
                Content = request.Query,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(userMessage);

            // Get relevant contexts
            var contexts = await _context.Contexts
                .Where(c => c.TenantId == tenantId && c.IsActive)
                .Where(c => c.AlwaysInclude || c.TriggerKeywords.Any(kw => request.Query.ToLower().Contains(kw.ToLower())))
                .OrderByDescending(c => c.Priority)
                .ToListAsync();

            // Search products using semantic search
            var products = await SearchProductsSemanticAsync(
                tenantId,
                request.Query,
                tenant.RAGConfiguration,
                request.TopK > 0 ? request.TopK : tenant.RAGConfiguration.DefaultTopK
            );

            // Build context for LLM
            var contextText = BuildContextText(contexts, products);

            // Generate AI response
            var aiResponse = await GenerateAIResponse(
                request.Query,
                contextText,
                tenant.RAGConfiguration,
                session
            );

            // Save assistant message
            var assistantMessage = new ChatMessage
            {
                ChatSessionId = session.Id,
                Role = MessageRole.ASSISTANT,
                Content = aiResponse,
                ProductIdsJson = System.Text.Json.JsonSerializer.Serialize(products.Select(p => p.Id).ToArray()),
                ContextIdsJson = System.Text.Json.JsonSerializer.Serialize(contexts.Select(c => c.Id).ToArray()),
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(assistantMessage);

            // Update session
            session.MessageCount += 2;
            session.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            stopwatch.Stop();

            _logger.LogInformation(
                "Chat message processed for tenant {TenantId}, session {SessionId} in {ElapsedMs}ms",
                tenantId, session.SessionId, stopwatch.ElapsedMilliseconds);

            return Ok(new ChatResponse
            {
                SessionId = session.SessionId,
                Response = aiResponse,
                Context = contextText,
                ProductsReferenced = products.Select(p => new ProductReference
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    Handle = p.Handle
                }).ToList(),
                ContextsUsed = contexts.Select(c => c.Title).ToList(),
                MessageCount = session.MessageCount,
                ElapsedMs = stopwatch.ElapsedMilliseconds,
                ShopifyStoreUrl = tenant.ShopifyStoreUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message for tenant {TenantId}", tenantId);
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get chat history for a session
    /// </summary>
    [HttpGet("{tenantId}/history/{sessionId}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHistory(int tenantId, string sessionId)
    {
        var session = await _context.ChatSessions
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.TenantId == tenantId);

        if (session == null)
        {
            return NotFound(new { message = "Session not found" });
        }

        var messages = session.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Role,
                m.Content,
                m.CreatedAt
            })
            .ToList();

        return Ok(new
        {
            SessionId = session.SessionId,
            StartedAt = session.StartedAt,
            MessageCount = session.MessageCount,
            Messages = messages
        });
    }

    // Helper methods
    private string BuildContextText(List<Context> contexts, List<Product> products)
    {
        var parts = new List<string>();

        if (contexts.Any())
        {
            parts.Add("# Mağaza Bilgileri\n");
            foreach (var context in contexts)
            {
                parts.Add($"## {context.Title}\n{context.Content}\n");
            }
        }

        if (products.Any())
        {
            parts.Add("\n# Ürünler\n");
            foreach (var product in products)
            {
                parts.Add($"- {product.Title} - {product.Price} TL");
            }
        }

        return string.Join("\n", parts);
    }

    private async Task<string> GenerateAIResponse(
        string query,
        string context,
        RAGConfiguration config,
        ChatSession session)
    {
        try
        {
            // Prepare conversation history
            var conversationHistory = session.Messages
                .OrderBy(m => m.CreatedAt)
                .TakeLast(6) // Last 3 exchanges
                .Select(m => new
                {
                    role = m.Role.ToString(),
                    content = m.Content
                })
                .ToList();

            // Call Python RAG service /chat endpoint
            var requestBody = new
            {
                tenant_id = session.TenantId,
                query = query,
                context = context,
                conversation_history = conversationHistory,
                system_prompt = config.SystemPrompt,
                llm_provider = config.LLMProvider.ToString().ToLower(),
                llm_model = config.LLMModel,
                llm_api_key = config.LLMApiKey,
                temperature = config.LLMTemperature,
                max_tokens = config.LLMMaxTokens
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var pythonApiUrl = _configuration["PythonRAG:BaseUrl"] ?? "http://localhost:8000";
            
            // Debug: Log the request body
            var requestJson = JsonSerializer.Serialize(requestBody);
            _logger.LogInformation("Sending request to Python RAG: {RequestJson}", requestJson);
            
            var response = await _httpClient.PostAsync($"{pythonApiUrl}/chat", jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Python RAG API error: {StatusCode} - {Content}",
                    response.StatusCode, errorContent);
                return "Üzgünüm, şu anda yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin.";
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var chatResponse = JsonSerializer.Deserialize<PythonChatResponse>(responseContent);

            return chatResponse?.response ?? "Üzgünüm, yanıt alınamadı.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI response");
            return "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
        }
    }

    private async Task<List<Product>> SearchProductsSemanticAsync(
        int tenantId,
        string query,
        RAGConfiguration config,
        int topK)
    {
        try
        {
            // Generate embedding for the query
            var queryEmbedding = await _ragService.GenerateEmbeddingAsync(
                tenantId,
                query,
                config
            );

            // Get all products with embeddings
            var products = await _context.Products
                .Where(p => p.TenantId == tenantId && p.HasEmbedding)
                .ToListAsync();

            if (products.Count == 0)
            {
                _logger.LogWarning("No products with embeddings found for tenant {TenantId}", tenantId);
                return new List<Product>();
            }

            // Calculate cosine similarity for each product
            var productScores = new List<(Product product, double score)>();

            foreach (var product in products)
            {
                try
                {
                    var productEmbedding = JsonSerializer.Deserialize<double[]>(product.EmbeddingJson ?? "[]");
                    if (productEmbedding == null || productEmbedding.Length == 0)
                        continue;

                    // Cosine similarity
                    var similarity = CosineSimilarity(queryEmbedding, productEmbedding);
                    productScores.Add((product, similarity));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse embedding for product {ProductId}", product.Id);
                }
            }

            // Sort by similarity and take top K
            var topProducts = productScores
                .OrderByDescending(p => p.score)
                .Take(topK)
                .Where(p => p.score >= config.MinimumSimilarityScore)
                .Select(p => p.product)
                .ToList();

            _logger.LogInformation(
                "Semantic search found {Count} products for query '{Query}' (tenant {TenantId})",
                topProducts.Count, query, tenantId);

            return topProducts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in semantic search for tenant {TenantId}", tenantId);
            // Fallback to simple search
            return await _context.Products
                .Where(p => p.TenantId == tenantId && p.HasEmbedding)
                .Take(topK)
                .ToListAsync();
        }
    }

    private double CosineSimilarity(double[] vec1, double[] vec2)
    {
        if (vec1.Length != vec2.Length)
            return 0.0;

        double dotProduct = 0.0;
        double mag1 = 0.0;
        double mag2 = 0.0;

        for (int i = 0; i < vec1.Length; i++)
        {
            dotProduct += vec1[i] * vec2[i];
            mag1 += vec1[i] * vec1[i];
            mag2 += vec2[i] * vec2[i];
        }

        mag1 = Math.Sqrt(mag1);
        mag2 = Math.Sqrt(mag2);

        if (mag1 == 0.0 || mag2 == 0.0)
            return 0.0;

        return dotProduct / (mag1 * mag2);
    }

    private class PythonChatResponse
    {
        public string response { get; set; } = default!;
        public int? tokens_used { get; set; }
        public double elapsed_ms { get; set; }
    }
}

// Request/Response models
public class ChatRequest
{
    public string Query { get; set; } = default!;
    public string? SessionId { get; set; }
    public string? UserFingerprint { get; set; }
    public int TopK { get; set; } = 3;
}

public class ChatResponse
{
    public string SessionId { get; set; } = default!;
    public string Response { get; set; } = default!;
    public string? Context { get; set; }
    public List<ProductReference> ProductsReferenced { get; set; } = new();
    public List<string> ContextsUsed { get; set; } = new();
    public int MessageCount { get; set; }
    public long ElapsedMs { get; set; }
    public string? ShopifyStoreUrl { get; set; }
}

public class ProductReference
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Handle { get; set; }
}
