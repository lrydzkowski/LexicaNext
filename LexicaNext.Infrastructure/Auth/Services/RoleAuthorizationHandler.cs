using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Auth.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace LexicaNext.Infrastructure.Auth.Services;

internal class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
{
    private readonly Auth0Options _auth0Options;

    public RoleAuthorizationHandler(IOptions<Auth0Options> options)
    {
        _auth0Options = options.Value;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        IReadOnlyList<string> roles = context.User.Claims
            .Where(claim => claim.Type.EqualsIgnoreCase(_auth0Options.RoleClaimName))
            .Select(claim => claim.Value)
            .ToList();
        if (roles.Count == 0)
        {
            return Fail(context);
        }

        if (!ContainsRole(roles, requirement.Roles))
        {
            return Fail(context);
        }

        return Succeed(context, requirement);
    }

    private Task Fail(AuthorizationHandlerContext context)
    {
        context.Fail();

        return Task.CompletedTask;
    }

    private Task Succeed(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        context.Succeed(requirement);

        return Task.CompletedTask;
    }

    private bool ContainsRole(IReadOnlyList<string> roles, IReadOnlyList<string> requiredRoles)
    {
        return roles.Any(requiredRoles.ContainsIgnoreCase);
    }
}

internal class RoleRequirement : IAuthorizationRequirement
{
    public RoleRequirement(IReadOnlyList<string> roles)
    {
        Roles = roles;
    }

    public IReadOnlyList<string> Roles { get; }
}
