using System.Threading.RateLimiting;
using LexicaNext.Core;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Infrastructure.RateLimiting;
using LexicaNext.WebApp.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;

namespace LexicaNext.WebApp;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWebAppServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddProblemDetails();
        services.AddOpenApi();
        services.AddHttpContextAccessor();
        services.AddLogging(builder => builder.AddSeq(configuration.GetSection("Seq")));
        services.AddRateLimiting(configuration);

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

    private static void AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptionsType<RateLimitingOptions>(configuration, RateLimitingOptions.Position);
        services.AddRateLimiter(
            options =>
            {
                options.AddPolicy(
                    RateLimitingPolicyNames.AiGeneration,
                    httpContext =>
                    {
                        IServiceProvider requestServices = httpContext.RequestServices;
                        RateLimitingOptions rateLimitingOptions = requestServices
                            .GetRequiredService<IOptions<RateLimitingOptions>>()
                            .Value;
                        IUserContextResolver userContextResolver =
                            requestServices.GetRequiredService<IUserContextResolver>();

                        return RateLimitPartition.GetFixedWindowLimiter(
                            userContextResolver.GetUserId(),
                            _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = rateLimitingOptions.PermitLimit,
                                Window = rateLimitingOptions.WindowTime
                            }
                        );
                    }
                );
                options.OnRejected = async (context, cancellationToken) =>
                {
                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/problem+json";

                    ProblemDetails problemDetails = new()
                    {
                        Type = ProblemTypes.RateLimitExceeded,
                        Status = StatusCodes.Status429TooManyRequests,
                        Title = "Too many requests",
                        Detail = "You have exceeded the rate limit. Please wait a moment and try again."
                    };

                    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out TimeSpan retryAfter))
                    {
                        context.HttpContext.Response.Headers.RetryAfter =
                            ((int)retryAfter.TotalSeconds).ToString();
                    }

                    await context.HttpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
                };
            }
        );
    }
}
