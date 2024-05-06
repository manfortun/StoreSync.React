namespace StoreSync.DTO;

public class ProductSale
{
    public string Name { get; set; } = default!;
    public string Subtitle { get; set; } = default!;
    public int Count { get; set; }
    public double Total { get; set; }
}
