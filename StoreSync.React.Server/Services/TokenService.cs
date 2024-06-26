using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StoreSync.React.Server.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateJwtToken(IEnumerable<Claim> claims)
    {
        string jwtKey = _config["Jwt:SecretKey"] ?? throw new InvalidOperationException("No secret key in application settings.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        return GenerateJwtToken(credentials, claims);
    }

    public string GenerateJwtToken(SigningCredentials credentials, IEnumerable<Claim> claims)
    {
        ArgumentNullException.ThrowIfNull(credentials);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? throw new InvalidOperationException("No issuer in application settings."),
            audience: _config["Jwt:Audience"] ?? throw new InvalidOperationException("No audience in application settings."),
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: credentials
            );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
