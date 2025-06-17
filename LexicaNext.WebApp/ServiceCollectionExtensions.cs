using Microsoft.OpenApi.Models;

namespace LexicaNext.WebApp;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWebAppServices(this IServiceCollection services)
    {
        services.AddProblemDetails();
        services.AddOpenApi();
        services.AddHttpContextAccessor();

        return services;
    }

    private static void AddOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi(
            "v1",
            options =>
            {
                options.AddDocumentTransformer(
                    (document, _, _) =>
                    {
                        document.Servers = [];

                        OpenApiSecurityScheme scheme = new()
                        {
                            BearerFormat = "JSON Web Token",
                            Description = "Bearer authentication using a JWT.",
                            Scheme = "bearer",
                            Type = SecuritySchemeType.Http,
                            Reference = new OpenApiReference
                            {
                                Id = "Bearer",
                                Type = ReferenceType.SecurityScheme
                            }
                        };

                        document.Components ??= new OpenApiComponents();
                        document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();
                        document.Components.SecuritySchemes[scheme.Reference.Id] = scheme;
                        document.SecurityRequirements ??= [];
                        document.SecurityRequirements.Add(new OpenApiSecurityRequirement { [scheme] = [] });

                        return Task.CompletedTask;
                    }
                );
            }
        );
    }
}
