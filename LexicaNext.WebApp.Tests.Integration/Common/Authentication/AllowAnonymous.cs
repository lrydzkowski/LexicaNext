using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace LexicaNext.WebApp.Tests.Integration.Common.Authentication;

internal class AllowAnonymous : IAuthorizationHandler
{
    public Task HandleAsync(AuthorizationHandlerContext context)
    {
        foreach (IAuthorizationRequirement requirement in context.PendingRequirements.ToList())
        {
            if (requirement is not DenyAnonymousAuthorizationRequirement)
            {
                continue;
            }

            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
