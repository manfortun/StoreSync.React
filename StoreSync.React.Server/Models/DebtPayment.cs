using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.Models;

public class DebtPayment : IAuditable
{
    public string Id { get; set; } = default!;
    public string DebtorName { get; set; } = default!;
    public virtual Debtor Debtor { get; set; } = default!;
    public double Payment { get; set; }
    public DateTime DateCreated { get; set; }
}
