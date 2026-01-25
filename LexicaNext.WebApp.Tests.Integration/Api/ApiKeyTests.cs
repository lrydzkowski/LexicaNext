using System.Net;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LexicaNext.WebApp.Tests.Integration.Api;

[Collection(ApiTestCollection.CollectionName)]
[Trait(TestConstants.Category, ApiTestCollection.CollectionName)]
public class ApiKeyTests
{
    private readonly EndpointDataSource _endpointDataSource;

    private readonly IReadOnlyList<EndpointInfo> _endpointsToIgnore =
    [
        new() { HttpMethod = HttpMethod.Get, Path = "/openapi/test.json" },
        new() { HttpMethod = HttpMethod.Get, Path = "/api/recordings/test" }
    ];

    private readonly LogMessages _logMessages;

    private readonly VerifySettings _verifySettings;

    private readonly WebApiFactory _webApiFactory;

    public ApiKeyTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory;
        _verifySettings = webApiFactory.VerifySettings;
        _logMessages = webApiFactory.LogMessages;
        _endpointDataSource = _webApiFactory.Services.GetRequiredService<EndpointDataSource>();
    }

    [Fact]
    public async Task SendRequest_ShouldReturn401_WhenIncorrectApiKey()
    {
        IReadOnlyList<EndpointInfo> endpointsInfo = EndpointHelpers.GetEndpointsWithAuth(
            _endpointDataSource,
            _endpointsToIgnore
        );
        List<ApiAuth0TestsResult> results = await RunAsync(endpointsInfo, "invalid-test-key");

        await Verify(results, _verifySettings);
    }

    private async Task<List<ApiAuth0TestsResult>> RunAsync(
        IReadOnlyList<EndpointInfo> endpointsInfo,
        string? apiKey = null
    )
    {
        List<ApiAuth0TestsResult> results = [];
        foreach (EndpointInfo endpointInfo in endpointsInfo)
        {
            await using TestContextScope contextScope = new(_webApiFactory, _logMessages);

            using HttpRequestMessage requestMessage = new(endpointInfo.HttpMethod, endpointInfo.Path);
            if (apiKey is not null)
            {
                requestMessage.Headers.Add("X-API-Key", apiKey);
            }

            using HttpResponseMessage responseMessage = await _webApiFactory
                .WithCustomOptions(
                    new Dictionary<string, string?>
                    {
                        ["ApiKey:ValidKeys:0"] = "test-key"
                    }
                )
                .WithLogging(_logMessages, "Microsoft.AspNetCore.Authentication", LogLevel.Information)
                .WithLogging(_logMessages, "Microsoft.AspNetCore.Authorization", LogLevel.Information)
                .CreateClient()
                .SendAsync(requestMessage);

            results.Add(
                new ApiAuth0TestsResult
                {
                    RequestHttpMethod = endpointInfo.HttpMethod,
                    RequestPath = endpointInfo.Path,
                    ResponseStatusCode = responseMessage.StatusCode,
                    LogMessages = _logMessages.GetSerialized(6)
                }
            );
        }

        return results;
    }

    private class ApiAuth0TestsResult
    {
        public HttpMethod? RequestHttpMethod { get; init; }

        public string? RequestPath { get; init; }

        public HttpStatusCode ResponseStatusCode { get; init; }

        public string? LogMessages { get; init; }
    }
}
