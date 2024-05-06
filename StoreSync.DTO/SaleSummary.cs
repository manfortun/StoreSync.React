namespace StoreSync.DTO;

public class SaleSummary
{
    public double SaleForTheDay { get; set; }
    public double DailyAverage { get; set; }
    public Dictionary<string, ProductSale> ProductSales { get; set; } = default!;
}
