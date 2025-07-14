using System.Collections.Immutable;
using Microsoft.AspNetCore.Authentication;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class ApiKeyAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public ImmutableHashSet<string> ValidApiKeys { get; set; } = [];
}
