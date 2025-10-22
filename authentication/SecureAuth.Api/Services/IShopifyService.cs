using SecureAuth.Api.Models;

namespace SecureAuth.Api.Services;

public interface IShopifyService
{
    /// <summary>
    /// Fetch products from Shopify store
    /// </summary>
    Task<List<ShopifyProduct>> FetchProductsAsync(string shopifyStoreUrl, string? accessToken = null);
}

/// <summary>
/// Shopify product model (from API response)
/// </summary>
public class ShopifyProduct
{
    public long Id { get; set; }
    public string Title { get; set; } = default!;
    public string Vendor { get; set; } = default!;
    public string ProductType { get; set; } = default!;
    public string Handle { get; set; } = default!;
    public string? BodyHtml { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public List<ShopifyVariant> Variants { get; set; } = new();
    public List<ShopifyImage> Images { get; set; } = new();
}

public class ShopifyVariant
{
    public long Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Price { get; set; }
    public string? Option1 { get; set; } // e.g., Color
    public string? Option2 { get; set; } // e.g., Size
    public string? Option3 { get; set; }
}

public class ShopifyImage
{
    public long Id { get; set; }
    public string Src { get; set; } = default!;
}
