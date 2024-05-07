namespace StoreSync.DTO;

public class DebtWrite
{
    public string DebtorName { get; set; } = default!;
    public SalesWrite Debt { get; set; } = default!;
}
