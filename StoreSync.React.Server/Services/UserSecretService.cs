namespace StoreSync.React.Server.Services;

public class UserSecretService
{
    private readonly IConfiguration _config;

    public UserSecretService(IConfiguration config)
    {
        _config = config;
    }

    public string? TryGetSecret(string key)
    {
        return _config.GetValue<string>(key);
    }
}
