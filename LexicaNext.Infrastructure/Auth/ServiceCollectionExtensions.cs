using System.Security.Claims;
using LexicaNext.Core;
using LexicaNext.Infrastructure.Auth.Options;
using LexicaNext.Infrastructure.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace LexicaNext.Infrastructure.Auth;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureAuth0Services(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddOptions(configuration).AddAuth(configuration);
    }

    private static IServiceCollection AddOptions(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddOptionsType<Auth0Options>(configuration, Auth0Options.Position);
    }

    private static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication()
            .AddJwtBearer(
                AuthenticationSchemes.Auth0,
                options =>
                {
                    options.Authority =
                        $"https://{configuration[$"{Auth0Options.Position}:{nameof(Auth0Options.Domain)}"]}/";
                    options.Audience = configuration[$"{Auth0Options.Position}:{nameof(Auth0Options.Audience)}"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = ClaimTypes.NameIdentifier
                    };
                }
            );
        services.AddSingleton<IAuthorizationHandler, RoleAuthorizationHandler>();
        services.AddAuthorization(
            options =>
            {
                options.AddPolicy(
                    AuthorizationPolicies.IsAdmin,
                    policy => policy.RequireAuthenticatedUser()
                        .AddRequirements(new RoleRequirement([Roles.Admin]))
                );
            }
        );

        return services;
    }
}
