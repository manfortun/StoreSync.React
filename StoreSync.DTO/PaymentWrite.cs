namespace StoreSync.DTO;

public class PaymentWrite
{
    public string DebtorName { get; set; } = default!;
    public double Value { get; set; }
}
