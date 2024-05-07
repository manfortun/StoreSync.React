namespace StoreSync.DTO;

public class History
{
    public Dictionary<DateTime, SalesRead> Debts { get; set; } = new Dictionary<DateTime, SalesRead>();
    public Dictionary<DateTime, double> Payments { get; set; } = new Dictionary<DateTime, double>();
}
