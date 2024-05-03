namespace StoreSync.React.Server.Models;

public class Purchase
{
    public string SaleId { get; set; } = default!;
    public virtual Sale? Sale { get; set; }
    public string ProductId { get; set; } = default!;
    public virtual Product? Product { get; set; }
    public int Count { get; set; }
}
