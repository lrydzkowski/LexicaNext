using System.Net;
using System.Reflection;
using LexicaNext.Infrastructure.Auth;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Services;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

namespace LexicaNext.WebApp.Tests.Integration.Api;

[Collection(ApiTestCollection.CollectionName)]
[Trait(TestConstants.Category, ApiTestCollection.CollectionName)]
public class ApiAuth0Tests
{
    private static readonly IReadOnlyList<EndpointInfo> EndpointsToIgnore =
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
    }

    public static Task<TheoryData<string, string>> GetEndpointsAsync()
    {
        return EndpointHelpers.GetTheoryDataAsync(EndpointsToIgnore);
    }

    [Theory]
    [MemberData(nameof(GetEndpointsAsync), DisableDiscoveryEnumeration = true)]
    public async Task SendRequest_ShouldReturn401_WhenNoAccessToken(string httpMethod, string path)
    {
        ApiAuth0TestsResult result = await RunAsync(
            new EndpointInfo { HttpMethod = new HttpMethod(httpMethod), Path = path }
        );

        await Verify(result, _verifySettings).UseParameters(httpMethod, path);
    }

    [Theory]
    [MemberData(nameof(GetEndpointsAsync), DisableDiscoveryEnumeration = true)]
    public async Task SendRequest_ShouldReturn401_WhenOldAccessToken(string httpMethod, string path)
    {
        string accessToken = EmbeddedFile.GetContent(
            "Api/Assets/old_access_token.txt",
            Assembly.GetExecutingAssembly()
        );
        ApiAuth0TestsResult result = await RunAsync(
            new EndpointInfo { HttpMethod = new HttpMethod(httpMethod), Path = path },
            accessToken
        );

        VerifySettings verifySettings = VerifySettingsBuilder.Build();
        verifySettings.DisableDateCounting();
        await Verify(result, verifySettings).UseParameters(httpMethod, path);
    }

    [Theory]
    [MemberData(nameof(GetEndpointsAsync), DisableDiscoveryEnumeration = true)]
    public async Task SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken(string httpMethod, string path)
    {
        string accessToken = EmbeddedFile.GetContent(
            "Api/Assets/wrong_signature_access_token.txt",
            Assembly.GetExecutingAssembly()
        );
        ApiAuth0TestsResult result = await RunAsync(
            new EndpointInfo { HttpMethod = new HttpMethod(httpMethod), Path = path },
            accessToken
        );

        await Verify(result, _verifySettings).UseParameters(httpMethod, path);
    }

    private async Task<ApiAuth0TestsResult> RunAsync(
        EndpointInfo endpointInfo,
        string? accessToken = null
    )
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
