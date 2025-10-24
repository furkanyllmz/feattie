using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureAuth.Api.Data;
using SecureAuth.Api.DTOs;
using SecureAuth.Api.Models;

namespace SecureAuth.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId}/rag-config")]
[Authorize(Policy = "AdminOnly")]
public class RAGConfigurationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<RAGConfigurationController> _logger;

    public RAGConfigurationController(AppDbContext context, ILogger<RAGConfigurationController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get RAG configuration for tenant
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<RAGConfigurationResponse>> GetConfiguration(int tenantId)
    {
        var config = await _context.RAGConfigurations
            .FirstOrDefaultAsync(r => r.TenantId == tenantId);

        if (config == null)
        {
            return NotFound(new { message = "RAG configuration not found for this tenant" });
        }

        return Ok(MapToResponse(config));
    }

    /// <summary>
    /// Create RAG configuration for tenant
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RAGConfigurationResponse>> CreateConfiguration(
        int tenantId,
        [FromBody] CreateRAGConfigurationRequest request)
    {
        // Check if tenant exists
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }

        // Check if config already exists
        if (await _context.RAGConfigurations.AnyAsync(r => r.TenantId == tenantId))
        {
            return BadRequest(new { message = "RAG configuration already exists for this tenant" });
        }

        if (!Enum.TryParse<EmbeddingProvider>(request.EmbeddingProvider, out var embeddingProvider))
        {
            return BadRequest(new { message = "Invalid embedding provider" });
        }

        if (!Enum.TryParse<LLMProvider>(request.LLMProvider, out var llmProvider))
        {
            return BadRequest(new { message = "Invalid LLM provider" });
        }

        var config = new RAGConfiguration
        {
            TenantId = tenantId,
            EmbeddingProvider = embeddingProvider,
            EmbeddingModel = request.EmbeddingModel,
            OpenAIApiKey = request.OpenAIApiKey,
            OpenAIEmbeddingModel = request.OpenAIEmbeddingModel,
            LLMProvider = llmProvider,
            LLMModel = request.LLMModel,
            LLMApiKey = request.LLMApiKey,
            LLMTemperature = request.LLMTemperature,
            LLMMaxTokens = request.LLMMaxTokens,
            DefaultTopK = request.DefaultTopK,
            DeduplicateResults = request.DeduplicateResults,
            MinimumSimilarityScore = request.MinimumSimilarityScore,
            Language = request.Language,
            SystemPrompt = request.SystemPrompt,
            EnableContextInjection = request.EnableContextInjection,
            EnableConversationHistory = request.EnableConversationHistory,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.RAGConfigurations.Add(config);
        await _context.SaveChangesAsync();

        _logger.LogInformation("RAG configuration created for tenant {TenantId}", tenantId);

        return CreatedAtAction(
            nameof(GetConfiguration),
            new { tenantId },
            MapToResponse(config)
        );
    }

    /// <summary>
    /// Update RAG configuration
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<RAGConfigurationResponse>> UpdateConfiguration(
        int tenantId,
        [FromBody] UpdateRAGConfigurationRequest request)
    {
        var config = await _context.RAGConfigurations
            .FirstOrDefaultAsync(r => r.TenantId == tenantId);

        if (config == null)
        {
            return NotFound(new { message = "RAG configuration not found" });
        }

        if (request.EmbeddingProvider != null && Enum.TryParse<EmbeddingProvider>(request.EmbeddingProvider, out var embeddingProvider))
        {
            config.EmbeddingProvider = embeddingProvider;
        }

        if (request.EmbeddingModel != null) config.EmbeddingModel = request.EmbeddingModel;
        if (request.OpenAIApiKey != null) config.OpenAIApiKey = request.OpenAIApiKey;
        if (request.OpenAIEmbeddingModel != null) config.OpenAIEmbeddingModel = request.OpenAIEmbeddingModel;

        if (request.LLMProvider != null && Enum.TryParse<LLMProvider>(request.LLMProvider, out var llmProvider))
        {
            config.LLMProvider = llmProvider;
        }

        if (request.LLMModel != null) config.LLMModel = request.LLMModel;
        if (request.LLMApiKey != null) config.LLMApiKey = request.LLMApiKey;
        if (request.LLMTemperature.HasValue) config.LLMTemperature = request.LLMTemperature.Value;
        if (request.LLMMaxTokens.HasValue) config.LLMMaxTokens = request.LLMMaxTokens.Value;
        if (request.DefaultTopK.HasValue) config.DefaultTopK = request.DefaultTopK.Value;
        if (request.DeduplicateResults.HasValue) config.DeduplicateResults = request.DeduplicateResults.Value;
        if (request.MinimumSimilarityScore.HasValue) config.MinimumSimilarityScore = request.MinimumSimilarityScore.Value;
        if (request.Language != null) config.Language = request.Language;
        if (request.SystemPrompt != null) config.SystemPrompt = request.SystemPrompt;
        if (request.EnableContextInjection.HasValue) config.EnableContextInjection = request.EnableContextInjection.Value;
        if (request.EnableConversationHistory.HasValue) config.EnableConversationHistory = request.EnableConversationHistory.Value;

        config.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("RAG configuration updated for tenant {TenantId}", tenantId);

        return Ok(MapToResponse(config));
    }

    /// <summary>
    /// Delete RAG configuration
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> DeleteConfiguration(int tenantId)
    {
        var config = await _context.RAGConfigurations
            .FirstOrDefaultAsync(r => r.TenantId == tenantId);

        if (config == null)
        {
            return NotFound(new { message = "RAG configuration not found" });
        }

        _context.RAGConfigurations.Remove(config);
        await _context.SaveChangesAsync();

        _logger.LogInformation("RAG configuration deleted for tenant {TenantId}", tenantId);

        return NoContent();
    }

    // Helper methods
    private static RAGConfigurationResponse MapToResponse(RAGConfiguration config)
    {
        return new RAGConfigurationResponse(
            config.Id,
            config.TenantId,
            config.EmbeddingProvider.ToString(),
            config.EmbeddingModel,
            config.OpenAIApiKey,
            config.OpenAIEmbeddingModel,
            config.LLMProvider.ToString(),
            config.LLMModel,
            config.LLMApiKey,
            config.LLMTemperature,
            config.LLMMaxTokens,
            config.DefaultTopK,
            config.DeduplicateResults,
            config.MinimumSimilarityScore,
            config.Language,
            config.SystemPrompt,
            config.EnableContextInjection,
            config.EnableConversationHistory,
            config.CreatedAt,
            config.UpdatedAt
        );
    }
}
