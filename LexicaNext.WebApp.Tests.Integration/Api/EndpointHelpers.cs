using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;

namespace LexicaNext.WebApp.Tests.Integration.Api;

internal static class EndpointHelpers
{
    private const string DefaultPathParameterPlaceholder = "test";

    public static IReadOnlyList<EndpointInfo> GetEndpointsWithAuth(
        EndpointDataSource endpointDataSource,
        string? authenticationScheme = null,
        string? policyName = null,
        IReadOnlyList<EndpointInfo>? ignoredEndpoints = null
    )
    {
        ignoredEndpoints ??= [];
        List<EndpointInfo> endpoints = endpointDataSource.Endpoints
            .Where(endpoint => endpoint is RouteEndpoint)
            .Cast<RouteEndpoint>()
            .Where(endpoint => !IsFallbackEndpoint(endpoint))
            .Where(endpoint => HasAuthenticationScheme(endpoint, authenticationScheme))
            .Where(endpoint => HasAuthPolicy(endpoint, policyName))
            .SelectMany(MapToEndpointsInfo)
            .Where(endpoint => FilterIgnoredEndpoints(ignoredEndpoints, endpoint))
            .OrderBy(endpoint => endpoint.Path)
            .ThenBy(endpoint => endpoint.HttpMethod.ToString())
            .ToList();

        return endpoints;
    }

    private static bool HasAuthenticationScheme(RouteEndpoint endpoint, string? scheme)
    {
        if (endpoint.Metadata.OfType<AllowAnonymousAttribute>().Any())
        {
            return false;
        }

        List<AuthorizeAttribute> authorizeAttributes = endpoint.Metadata.OfType<AuthorizeAttribute>().ToList();
        if (scheme is null)
        {
            return authorizeAttributes.Count == 0
                   || authorizeAttributes.All(authorizeAttribute => authorizeAttribute.AuthenticationSchemes is null);
        }

        return authorizeAttributes.Any(
            authorizeAttribute =>
                authorizeAttribute.AuthenticationSchemes.EqualsIgnoreCase(scheme)
        );
    }

    private static bool HasAuthPolicy(RouteEndpoint endpoint, string? policyName)
    {
        if (endpoint.Metadata.OfType<AllowAnonymousAttribute>().Any())
        {
            return false;
        }

        if (policyName is null)
        {
            return true;
        }

        return endpoint.Metadata.OfType<AuthorizeAttribute>()
            .Any(x => x.Policy?.EqualsIgnoreCase(policyName) == true);
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
