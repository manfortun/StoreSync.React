using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.Models;

public class Product : ISoftDeletable
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Subtitle { get; set; } = default!;
    public bool IsDeleted { get; set; }
    public virtual ICollection<Price> Prices { get; set; } = default!;
    public virtual ICollection<Purchase> Purchases { get; set; } = default!;
}
