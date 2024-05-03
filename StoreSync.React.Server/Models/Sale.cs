namespace StoreSync.React.Server.Models;

public class Sale
{
    public string Id { get; set; }
    public DateTime DateOfPurchase { get; set; }
    public virtual ICollection<Purchase> Purchases { get; set; } = default!;
}
