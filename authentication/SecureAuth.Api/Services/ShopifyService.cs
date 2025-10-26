using System.Text.Json;
using System.Text.RegularExpressions;

namespace SecureAuth.Api.Services;

public class ShopifyService : IShopifyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ShopifyService> _logger;

    public ShopifyService(HttpClient httpClient, ILogger<ShopifyService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<ShopifyProduct>> FetchProductsAsync(string shopifyStoreUrl, string? accessToken = null)
    {
        _logger.LogInformation("Fetching products from Shopify using shop_pull.py: {Url}", shopifyStoreUrl);

        try
        {
            // Get project root dynamically
            var currentDir = Directory.GetCurrentDirectory();
            string projectRoot;

            // Check if we're in bin/Debug/net9.0 (runtime) or SecureAuth.Api (development)
            if (currentDir.Contains("bin"))
            {
                // Running from bin/Debug/net9.0 - go up to feattie root
                projectRoot = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "..", "..", ".."));
            }
            else if (currentDir.Contains("SecureAuth.Api"))
            {
                // Running from authentication/SecureAuth.Api - go up to feattie root
                projectRoot = Path.GetFullPath(Path.Combine(currentDir, "..", ".."));
            }
            else
            {
                // Fallback: assume we're already at feattie root
                projectRoot = currentDir;
            }

            _logger.LogInformation("Current directory: {CurrentDir}", currentDir);
            _logger.LogInformation("Project root: {ProjectRoot}", projectRoot);

            var tempDir = Path.Combine(projectRoot, "temp_sync");
            if (Directory.Exists(tempDir))
            {
                Directory.Delete(tempDir, true);
            }
            Directory.CreateDirectory(tempDir);

            // Use the existing shop_pull.py script
            // Use python3 on Linux/Mac, python on Windows
            var pythonCommand = OperatingSystem.IsWindows() ? "python" : "python3";
            var process = new System.Diagnostics.Process
            {
                StartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = pythonCommand,
                    Arguments = $"shop_pull.py --base-url {shopifyStoreUrl} --outdir ./temp_sync --max-pages 5 --per-page 250",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = projectRoot
                }
            };

            process.Start();
            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            _logger.LogInformation("shop_pull.py output: {Output}", output);
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("shop_pull.py stderr: {Error}", error);
            }

            if (process.ExitCode != 0)
            {
                _logger.LogError("shop_pull.py failed with exit code {ExitCode}", process.ExitCode);
                throw new Exception($"Failed to fetch products: {error}");
            }

            // Read the generated RAG JSONL file
            var ragPath = Path.Combine(tempDir, "products_rag.jsonl");
            if (!File.Exists(ragPath))
            {
                throw new Exception($"RAG file not generated at {ragPath}");
            }

            var products = new List<ShopifyProduct>();
            var lines = await File.ReadAllLinesAsync(ragPath);

            // Group variants by product_id
            var productGroups = new Dictionary<long, List<Dictionary<string, JsonElement>>>();

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                var ragProduct = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(line);
                if (ragProduct == null) continue;

                if (!ragProduct.TryGetValue("product_id", out var pidElement)) continue;
                var productId = pidElement.GetInt64();

                if (!productGroups.ContainsKey(productId))
                {
                    productGroups[productId] = new List<Dictionary<string, JsonElement>>();
                }
                productGroups[productId].Add(ragProduct);
            }

            // Convert to ShopifyProduct objects
            foreach (var (productId, variants) in productGroups)
            {
                var firstVariant = variants.First();

                // Get images from JSONL data (no need to call Shopify API)
                var images = new List<ShopifyImage>();
                var uniqueImageUrls = new HashSet<string>();

                foreach (var variantData in variants)
                {
                    if (variantData.TryGetValue("image_url", out var imgUrl) && imgUrl.ValueKind == JsonValueKind.String)
                    {
                        var imageUrl = imgUrl.GetString();
                        if (!string.IsNullOrEmpty(imageUrl) && uniqueImageUrls.Add(imageUrl))
                        {
                            images.Add(new ShopifyImage
                            {
                                Id = 0, // Not needed since we have the URL
                                Src = imageUrl
                            });
                        }
                    }
                }

                var product = new ShopifyProduct
                {
                    Id = productId,
                    Title = firstVariant.TryGetValue("title", out var t) ? t.GetString()?.Split(" — ")[0] ?? "" : "",
                    Vendor = firstVariant.TryGetValue("vendor", out var v) ? v.GetString() ?? "" : "",
                    ProductType = firstVariant.TryGetValue("product_type", out var pt) ? pt.GetString() ?? "" : "",
                    Handle = firstVariant.TryGetValue("handle", out var h) ? h.GetString() ?? "" : "",
                    Tags = firstVariant.TryGetValue("tags", out var tags)
                        ? tags.EnumerateArray().Select(t => t.GetString() ?? "").ToArray()
                        : Array.Empty<string>(),
                    Variants = new List<ShopifyVariant>(),
                    Images = images
                };

                // Add all variants
                foreach (var variantData in variants)
                {
                    var variant = new ShopifyVariant
                    {
                        Id = variantData.TryGetValue("variant_id", out var vid) ? vid.GetInt64() : 0,
                        Title = variantData.TryGetValue("title", out var vt) ? vt.GetString() ?? "" : "",
                        Price = variantData.TryGetValue("price", out var p) && p.ValueKind == JsonValueKind.Number
                            ? p.GetDouble().ToString("F2")
                            : "0.00",
                        Option1 = variantData.TryGetValue("colors", out var colors) && colors.GetArrayLength() > 0
                            ? colors[0].GetString()
                            : null,
                        Option2 = variantData.TryGetValue("sizes", out var sizes) && sizes.GetArrayLength() > 0
                            ? sizes[0].GetString()
                            : null
                    };

                    product.Variants.Add(variant);
                }

                products.Add(product);
            }

            _logger.LogInformation("Loaded {ProductCount} products with {VariantCount} total variants from RAG file",
                products.Count,
                products.Sum(p => p.Variants.Count));

            return products;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products with shop_pull.py");
            throw;
        }
    }

    private async Task<Dictionary<long, List<ShopifyImage>>> FetchProductImagesAsync(string shopifyStoreUrl, List<long> productIds)
    {
        var result = new Dictionary<long, List<ShopifyImage>>();
        var cleanUrl = shopifyStoreUrl.TrimEnd('/');

        // Fetch products in batches to get images
        var batchSize = 50;
        for (int i = 0; i < productIds.Count; i += batchSize)
        {
            var batch = productIds.Skip(i).Take(batchSize).ToList();

            foreach (var productId in batch)
            {
                try
                {
                    var url = $"{cleanUrl}/products/{productId}.json";
                    var response = await _httpClient.GetAsync(url);

                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var productResponse = JsonSerializer.Deserialize<ShopifyProductResponse>(content);

                        if (productResponse?.Product?.Images != null && productResponse.Product.Images.Any())
                        {
                            result[productId] = productResponse.Product.Images
                                .Select(img => new ShopifyImage
                                {
                                    Id = img.Id,
                                    Src = img.Src
                                })
                                .ToList();
                        }
                    }

                    // Small delay to avoid rate limiting
                    await Task.Delay(100);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch images for product {ProductId}", productId);
                }
            }
        }

        _logger.LogInformation("Fetched images for {Count} products", result.Count);
        return result;
    }

    private string? GetNextPageUrl(HttpResponseMessage response)
    {
        if (!response.Headers.TryGetValues("Link", out var linkHeaders))
        {
            return null;
        }

        var linkHeader = linkHeaders.FirstOrDefault();
        if (string.IsNullOrEmpty(linkHeader))
        {
            return null;
        }

        // Parse Link header: <https://store.com/products.json?page=2>; rel="next"
        var match = Regex.Match(linkHeader, @"<([^>]+)>;\s*rel=""next""");
        return match.Success ? match.Groups[1].Value : null;
    }

    private class ShopifyProductsResponse
    {
        public List<ShopifyProduct> Products { get; set; } = new();
    }

    private class ShopifyProductResponse
    {
        public ShopifyProductDetail? Product { get; set; }
    }

    private class ShopifyProductDetail
    {
        public long Id { get; set; }
        public List<ShopifyImageDetail>? Images { get; set; }
    }

    private class ShopifyImageDetail
    {
        public long Id { get; set; }
        public string Src { get; set; } = default!;
    }
}
