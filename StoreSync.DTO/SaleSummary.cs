namespace StoreSync.DTO;

public class SaleSummary
{
    public Dictionary<string, ProductSale> ProductSales { get; set; } = default!;
}
