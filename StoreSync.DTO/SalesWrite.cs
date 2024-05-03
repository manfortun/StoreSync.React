namespace StoreSync.DTO;

public class SalesWrite
{
    public List<PurchaseWrite> Purchases { get; set; } = default!;
}
