using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using StoreSync.DTO;
using StoreSync.React.Server.DataAccess;
using StoreSync.React.Server.Models;
using StoreSync.React.Server.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace StoreSync.React.Server.Controllers;

[ApiController]
[Route("/API/[controller]")]
public class LoginController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly TokenService _tokenService;

    public LoginController(
        AppDbContext context,
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        TokenService tokenService)
    {
        _unitOfWork = new UnitOfWork(context);
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost]
    [Obsolete("Use LoginUser instead.")]
    public IActionResult Login([FromBody] LoginModel login)
    {
        if (login.Pin == "0000")
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("your-256-bit-secret-key-for-jwt-signing-12345");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, login.Username),
                }),
                Expires = DateTime.UtcNow.AddSeconds(10),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString });
        }

        return Unauthorized();
    }

    [HttpPost("SignUp")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            IdentityUser user = new IdentityUser { UserName = request.Username, Email = request.Email };
            IdentityResult result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                string[] errors = result.Errors.Select(e => e.Description).ToArray();
                return BadRequest(errors);
            }

            User newUser = new User { Id = user.Id, FirstName = request.FirstName, LastName = request.LastName };
            _unitOfWork.Users.Insert(newUser);
            _unitOfWork.Save();

            var principal = await _signInManager.CreateUserPrincipalAsync(user);

            string token = _tokenService.GenerateJwtToken(principal.Claims);

            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpGet("LoginUser")]
    public async Task<IActionResult> LoginUser(string username, string password)
    {
        try
        {
            SignInResult signInResult = await _signInManager.PasswordSignInAsync(
                username,
                password,
                isPersistent: false,
                lockoutOnFailure: false);

            if (signInResult.Succeeded)
            {
                try
                {
                    var identityUser = await _userManager.FindByNameAsync(username);
                    var principal = await _signInManager.CreateUserPrincipalAsync(identityUser);

                    string token = _tokenService.GenerateJwtToken(principal.Claims);

                    return Ok(new { Token = token });
                }
                catch
                {
                    return BadRequest();
                }
            }
            else
            {
                return BadRequest();
            }
        }
        catch
        {
            return BadRequest();
        }
    }
}
