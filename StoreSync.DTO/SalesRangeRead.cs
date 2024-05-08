namespace StoreSync.DTO;

public class SalesRangeRead
{
    public Dictionary<DateTime, double> Debts { get; set; } = default!;
    public Dictionary<DateTime, double> Sales { get; set; } = default!;
    public double Average { get; set; }
}
