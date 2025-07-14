using System.Net;
using System.Reflection;
using LexicaNext.Infrastructure.Auth;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Services;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

namespace LexicaNext.WebApp.Tests.Integration.Api;

[Collection(ApiTestCollection.CollectionName)]
[Trait(TestConstants.Category, ApiTestCollection.CollectionName)]
public class ApiAuth0Tests
{
    private readonly EndpointDataSource _endpointDataSource;

    private readonly IReadOnlyList<EndpointInfo> _endpointsToIgnore =
    [
        new() { HttpMethod = HttpMethod.Get, Path = "/openapi/test.json" }
    ];

    private readonly LogMessages _logMessages;

    private readonly VerifySettings _verifySettings;

    private readonly WebApiFactory _webApiFactory;

    public ApiAuth0Tests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory;
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
        _endpointDataSource = _webApiFactory.Services.GetRequiredService<EndpointDataSource>();
    }

    [Fact]
    public async Task SendRequest_ShouldReturn401_WhenNoAccessToken()
    {
        IReadOnlyList<EndpointInfo> endpointsInfo = EndpointHelpers.GetEndpointsWithAuth(
            _endpointDataSource,
            ignoredEndpoints: _endpointsToIgnore
        );
        List<ApiAuth0TestsResult> results = await RunAsync(endpointsInfo);

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task SendRequest_ShouldReturn401_WhenOldAccessToken()
    {
        IReadOnlyList<EndpointInfo> endpointsInfo = EndpointHelpers.GetEndpointsWithAuth(
            _endpointDataSource,
            ignoredEndpoints: _endpointsToIgnore
        );
        string accessToken = EmbeddedFile.GetContent(
            "Api/Assets/old_access_token.txt",
            Assembly.GetExecutingAssembly()
        );
        List<ApiAuth0TestsResult> results = await RunAsync(endpointsInfo, accessToken);

        VerifySettings verifySettings = VerifySettingsBuilder.Build();
        verifySettings.DisableDateCounting();
        await Verify(results, verifySettings);
    }

    [Fact]
    public async Task SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken()
    {
        IReadOnlyList<EndpointInfo> endpointsInfo = EndpointHelpers.GetEndpointsWithAuth(
            _endpointDataSource,
            ignoredEndpoints: _endpointsToIgnore
        );
        string accessToken = EmbeddedFile.GetContent(
            "Api/Assets/wrong_signature_access_token.txt",
            Assembly.GetExecutingAssembly()
        );
        List<ApiAuth0TestsResult> results = await RunAsync(endpointsInfo, accessToken);

        await Verify(results, _verifySettings);
    }

    private async Task<List<ApiAuth0TestsResult>> RunAsync(
        IReadOnlyList<EndpointInfo> endpointsInfo,
        string? accessToken = null
    )
    {
        List<ApiAuth0TestsResult> results = [];
        foreach (EndpointInfo endpointInfo in endpointsInfo)
        {
            await using TestContextScope contextScope = new(_webApiFactory, _logMessages);

            using HttpRequestMessage requestMessage = new(endpointInfo.HttpMethod, endpointInfo.Path);
            if (accessToken is not null)
            {
                requestMessage.Headers.Add(HeaderNames.Authorization, $"{AuthConstants.Bearer} {accessToken}");
            }

            using HttpResponseMessage responseMessage = await _webApiFactory
                .WithLogging(_logMessages, "Microsoft.AspNetCore.Authorization", LogLevel.Information)
                .WithLogging(_logMessages, "Microsoft.AspNetCore.Authentication", LogLevel.Information)
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
