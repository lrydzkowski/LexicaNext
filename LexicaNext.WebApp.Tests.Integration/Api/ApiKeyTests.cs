using System.Net;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.Extensions.Logging;

namespace LexicaNext.WebApp.Tests.Integration.Api;

[Collection(ApiTestCollection.CollectionName)]
[Trait(TestConstants.Category, ApiTestCollection.CollectionName)]
public class ApiKeyTests
{
    private static readonly IReadOnlyList<EndpointInfo> EndpointsToIgnore =
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
    }

    public static Task<TheoryData<string, string>> GetEndpointsAsync()
    {
        return EndpointHelpers.GetTheoryDataAsync(EndpointsToIgnore);
    }

    [Theory]
    [MemberData(nameof(GetEndpointsAsync), DisableDiscoveryEnumeration = true)]
    public async Task SendRequest_ShouldReturn401_WhenIncorrectApiKey(string httpMethod, string path)
    {
        ApiAuth0TestsResult result = await RunAsync(
            new EndpointInfo { HttpMethod = new HttpMethod(httpMethod), Path = path },
            "invalid-test-key"
        );

        await Verify(result, _verifySettings).UseParameters(httpMethod, path);
    }

    private async Task<ApiAuth0TestsResult> RunAsync(
        EndpointInfo endpointInfo,
        string? apiKey = null
    )
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
            .SendAsync(requestMessage, TestContext.Current.CancellationToken);

        return new ApiAuth0TestsResult
        {
            RequestHttpMethod = endpointInfo.HttpMethod,
            RequestPath = endpointInfo.Path,
            ResponseStatusCode = responseMessage.StatusCode,
            LogMessages = _logMessages.GetSerialized(6)
        };
    }

    private class ApiAuth0TestsResult
    {
        public HttpMethod? RequestHttpMethod { get; init; }

        public string? RequestPath { get; init; }

        public HttpStatusCode ResponseStatusCode { get; init; }

        public string? LogMessages { get; init; }
    }
}
