using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.Models;

public class Price : IAuditable
{
    public string Id { get; set; } = default!;
    public virtual Product? Product { get; set; }
    public double Value { get; set; }
    public DateTime DateCreated { get; set; }
}
