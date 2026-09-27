using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.WebApp.Tests.Integration.Api;

internal static class EndpointHelpers
{
    private const string DefaultPathParameterPlaceholder = "test";

    public static async Task<TheoryData<string, string>> GetTheoryDataAsync(
        IReadOnlyList<EndpointInfo> ignoredEndpoints
    )
    {
        WebApiFactory factory = await TestContext.Current.GetFixture<WebApiFactory>()
                                ?? throw new InvalidOperationException("The API test collection fixture is unavailable.");
        EndpointDataSource endpointDataSource = factory.Services.GetRequiredService<EndpointDataSource>();
        IReadOnlyList<EndpointInfo> endpoints = GetEndpointsWithAuth(endpointDataSource, ignoredEndpoints);
        TheoryData<string, string> cases = [];
        foreach (EndpointInfo endpoint in endpoints)
        {
            cases.Add(endpoint.HttpMethod.Method, endpoint.Path);
        }

        return cases;
    }

    public static IReadOnlyList<EndpointInfo> GetEndpointsWithAuth(
        EndpointDataSource endpointDataSource,
        IReadOnlyList<EndpointInfo>? ignoredEndpoints = null
    )
    {
        ignoredEndpoints ??= [];
        List<EndpointInfo> endpoints = endpointDataSource.Endpoints
            .Where(endpoint => endpoint is RouteEndpoint)
            .Cast<RouteEndpoint>()
            .Where(endpoint => !IsFallbackEndpoint(endpoint))
            .Where(endpoint => !AllowAnonymous(endpoint))
            .SelectMany(MapToEndpointsInfo)
            .Where(endpoint => FilterIgnoredEndpoints(ignoredEndpoints, endpoint))
            .OrderBy(endpoint => endpoint.Path)
            .ThenBy(endpoint => endpoint.HttpMethod.ToString())
            .ToList();

        return endpoints;
    }

    private static bool AllowAnonymous(RouteEndpoint endpoint)
    {
        return endpoint.Metadata.OfType<AllowAnonymousAttribute>().Any();
    }

    private static bool IsFallbackEndpoint(RouteEndpoint endpoint)
    {
        return endpoint.DisplayName?.StartsWith("Fallback") == true;
    }

    private static IEnumerable<EndpointInfo> MapToEndpointsInfo(RouteEndpoint endpoint)
    {
        List<EndpointInfo> endpointsInfo = [];
        IReadOnlyList<string> httpMethods =
            endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault()?.HttpMethods ?? [];
        foreach (string httpMethod in httpMethods)
        {
            string path = endpoint.RoutePattern.RawText ?? "";
            foreach (RoutePatternParameterPart parameter in endpoint.RoutePattern.Parameters)
            {
                path = path.Replace("{" + parameter.Name + "}", DefaultPathParameterPlaceholder);
            }

            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }

            endpointsInfo.Add(
                new EndpointInfo
                {
                    Path = path,
                    HttpMethod = new HttpMethod(httpMethod)
                }
            );
        }

        return endpointsInfo;
    }

    private static bool FilterIgnoredEndpoints(IReadOnlyList<EndpointInfo> ignoredEndpoints, EndpointInfo endpoint)
    {
        return !ignoredEndpoints.Any(
            ignoredEndpoint => ignoredEndpoint.Path.EqualsIgnoreCase(endpoint.Path)
                               && ignoredEndpoint.HttpMethod == endpoint.HttpMethod
        );
    }
}
