namespace StoreSync.DTO;

public class DailySaleRead
{
    public string TotalSales { get; set; } = default!;
    public int NoOfDays { get; set; }
    public string AverageSale { get; set; } = default!;
    public Dictionary<DateTime, double> Sales { get; set; } = new Dictionary<DateTime, double>();
    public Dictionary<DateTime, double> Payments { get; set; } = new Dictionary<DateTime, double>();
    public Dictionary<DateTime, double> Debts { get; set; } = new Dictionary<DateTime, double>();
}