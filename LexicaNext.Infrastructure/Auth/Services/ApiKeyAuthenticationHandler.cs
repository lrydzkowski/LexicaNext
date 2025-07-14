using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using LexicaNext.Core.Common.Infrastructure.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationSchemeOptions>
{
    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<ApiKeyAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder
    )
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(HttpHeaderNames.ApiKey, out StringValues apiKeyHeaderValues))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key header missing"));
        }

        string? providedApiKey = apiKeyHeaderValues.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(providedApiKey))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key header empty"));
        }

        if (!IsValidApiKey(providedApiKey))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key invalid"));
        }

        ClaimsIdentity identity = new("ApiKey");
        ClaimsPrincipal principal = new(identity);

        ClaimsPrincipal? existingPrincipal = Context.User;
        if (existingPrincipal?.Identity?.IsAuthenticated == true)
        {
            principal = new ClaimsPrincipal(existingPrincipal);
            principal.AddIdentity(identity);
        }

        AuthenticationTicket authTicket = new(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(authTicket));
    }

    private bool IsValidApiKey(string apiKey)
    {
        return Options.ValidApiKeys.Any(
            validKey => CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(apiKey),
                Encoding.UTF8.GetBytes(validKey)
            )
        );
    }
}
