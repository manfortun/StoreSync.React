using System.ComponentModel.DataAnnotations;

namespace StoreSync.React.Server.Models;

public class Debtor
{
    [Key]
    public string Name { get; set; } = default!;
    public virtual ICollection<Debt> Debts { get; set; } = default!;
    public virtual ICollection<DebtPayment>? Payments { get; set; } = default!;
}
