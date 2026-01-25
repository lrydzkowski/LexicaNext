using System.Security.Claims;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class UserContextResolver : IUserContextResolver, IScopedService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextResolver(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? GetUserId()
    {
        HttpContext? context = _httpContextAccessor.HttpContext;
        if (context == null)
        {
            return null;
        }

        Claim? userIdClaim =
            context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub");
        if (userIdClaim == null)
        {
            return null;
        }

        return userIdClaim.Value;
    }
}
