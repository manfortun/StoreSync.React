using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace StoreSync.React.Server.Models;

public class User
{
    [Key]
    public string Id { get; set; }
    public virtual IdentityUser IdentityUser { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    public string FirstName { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    public string LastName { get; set; } = default!;
}
