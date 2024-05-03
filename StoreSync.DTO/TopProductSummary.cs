namespace StoreSync.DTO;

public class TopProductSummary
{
    public Dictionary<string, string> ProductNames { get; set; } = default!;
    public Dictionary<string, double> Products { get; set; } = default!;
}
