using StoreSync.React.Server.Models.Interfaces;

namespace StoreSync.React.Server.Models;

public class Debt : IAuditable
{
    public string Id { get; set; } = default!;
    public string DebtorName { get; set; } = default!;
    public virtual Debtor Debtor { get; set; } = default!;
    public virtual ICollection<DebtPayment>? Payments { get; set; } = default!;
    public virtual ICollection<Sale> Sales { get; set; } = default!;
    public DateTime DateCreated { get; set; }
}
