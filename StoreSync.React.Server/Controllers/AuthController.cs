using Microsoft.AspNetCore.Mvc;
using StoreSync.React.Server.Services;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("/API/[controller]")]
public class AuthController : ControllerBase
{
    public enum GoogleKey { ClientId = 0, ClientSecret = 1 }

    private readonly UserSecretService _secretService;

    public AuthController(UserSecretService secretService)
    {
        _secretService = secretService;
    }

    [HttpGet("Google/{key}")]
    public IActionResult GetGoogleAuthKey(GoogleKey key)
    {
        switch (key)
        {
            case GoogleKey.ClientId:
                string? clientId = _secretService.TryGetSecret("GOOGLE_OAUTH_CLIENT_ID");
                return string.IsNullOrEmpty(clientId) ? BadRequest() : Ok(clientId);
            case GoogleKey.ClientSecret:
                string? clientSecret = _secretService.TryGetSecret("GOOGLE_OAUTH_CLIENT_SECRET");
                return string.IsNullOrEmpty(clientSecret) ? BadRequest() : Ok(clientSecret);
            default:
                return BadRequest();
        }
    }
}
