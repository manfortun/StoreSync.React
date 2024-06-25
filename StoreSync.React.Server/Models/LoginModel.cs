using System.ComponentModel.DataAnnotations;

namespace StoreSync.React.Server.Models;

public class LoginModel
{
    public string Username => "username";
    [DataType(DataType.Password)]
    public string Pin { get; set; }
}
