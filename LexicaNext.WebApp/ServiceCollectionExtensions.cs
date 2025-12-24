using Microsoft.OpenApi;

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

                        Dictionary<string, IOpenApiSecurityScheme> securitySchemes = new()
                        {
                            ["Bearer"] = new OpenApiSecurityScheme
                            {
                                Type = SecuritySchemeType.Http,
                                Scheme = "bearer",
                                In = ParameterLocation.Header,
                                BearerFormat = "Json Web Token"
                            }
                        };
                        document.Components ??= new OpenApiComponents();
                        document.Components.SecuritySchemes = securitySchemes;

                        IEnumerable<KeyValuePair<HttpMethod, OpenApiOperation>> operations = document.Paths.Values
                            .Where(path => path.Operations is not null)
                            .Select(path => path.Operations)
                            .Cast<Dictionary<HttpMethod, OpenApiOperation>>()
                            .SelectMany(path => path);
                        foreach (KeyValuePair<HttpMethod, OpenApiOperation> operation in operations)
                        {
                            operation.Value.Security ??= [];
                            operation.Value.Security.Add(
                                new OpenApiSecurityRequirement
                                {
                                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                                }
                            );
                        }

                        return Task.CompletedTask;
                    }
                );
            }
        );
    }
}
