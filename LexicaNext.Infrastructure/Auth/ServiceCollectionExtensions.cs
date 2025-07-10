using System.Security.Claims;
using LexicaNext.Core;
using LexicaNext.Core.Common.Infrastructure.Auth;
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
        return services.AddOptionsType<Auth0Options>(configuration, Auth0Options.Position)
            .AddOptionsType<ApiKeyOptions>(configuration, ApiKeyOptions.Position);
    }

    private static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(configuration);
        services.AddAuthorization();

        return services;
    }

    private static void AddAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(
                options =>
                {
                    options.DefaultScheme = AuthenticationSchemes.Auth0;
                    options.DefaultChallengeScheme = AuthenticationSchemes.Auth0;
                }
            )
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
            )
            .AddScheme<ApiKeyAuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
                AuthenticationSchemes.ApiKey,
                options =>
                {
                    ApiKeyOptions? apiKeyOptions =
                        configuration.GetSection(ApiKeyOptions.Position).Get<ApiKeyOptions>();
                    options.ValidApiKeys = apiKeyOptions?.ValidKeys.ToHashSet() ?? [];
                }
            );
    }

    private static void AddAuthorization(this IServiceCollection services)
    {
        services.AddSingleton<IAuthorizationHandler, RoleAuthorizationHandler>();
        services.AddAuthorization(
            options =>
            {
                options.AddPolicy(
                    AuthorizationPolicies.IsAdmin,
                    policy => policy.RequireAuthenticatedUser()
                        .AddRequirements(new RoleRequirement([Roles.Admin]))
                );
                options.AddPolicy(
                    AuthorizationPolicies.Auth0OrApiKey,
                    policy =>
                    {
                        policy.AddAuthenticationSchemes(AuthenticationSchemes.Auth0, AuthenticationSchemes.ApiKey);
                        policy.RequireAuthenticatedUser();
                    }
                );
            }
        );
    }
}
