using Microsoft.AspNetCore.Authentication;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class ApiKeyAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public HashSet<string> ValidApiKeys { get; set; } = [];
}
