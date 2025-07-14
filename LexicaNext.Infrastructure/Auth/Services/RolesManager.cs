using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Infrastructure.Auth.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class RolesManager
    : IScopedService, IRolesManager
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Auth0Options _options;
    private IReadOnlyList<string>? _roles;

    public RolesManager(IHttpContextAccessor httpContextAccessor, IOptions<Auth0Options> options)
    {
        _httpContextAccessor = httpContextAccessor;
        _options = options.Value;
    }

    public IReadOnlyList<string> Roles
    {
        get
        {
            _roles ??= _httpContextAccessor.HttpContext?.User.Claims
                .Where(claim => claim.Type.EqualsIgnoreCase(_options.RoleClaimName))
                .Select(claim => claim.Value)
                .ToList();

            return _roles ?? new List<string>();
        }
    }
}
