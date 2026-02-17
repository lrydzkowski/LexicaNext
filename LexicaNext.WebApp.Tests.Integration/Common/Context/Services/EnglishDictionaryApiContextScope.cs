using System.Net.Mime;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Net.Http.Headers;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class EnglishDictionaryApiContextScope
{
    private readonly WireMockServer _server;

    public EnglishDictionaryApiContextScope(WebApplicationFactory<Program> factory, WireMockServer server)
    {
        Factory = factory;
        _server = server;
    }

    public WebApplicationFactory<Program> Factory { get; private set; }

    public Task InitializeAsync(ITestCaseData testCase)
    {
        EnglishDictionaryApiTestCaseData data = testCase.Data.EnglishDictionaryApi;

        _server.Reset();

        foreach ((string word, string? html) in data.WordPages)
        {
            IRequestBuilder request = Request.Create().WithPath($"/{word}").UsingGet();

            if (data.ShouldFail || html is null)
            {
                int statusCode = data.ShouldFail
                    ? StatusCodes.Status500InternalServerError
                    : StatusCodes.Status404NotFound;
                _server.Given(request).RespondWith(Response.Create().WithStatusCode(statusCode));

                continue;
            }

            _server
                .Given(request)
                .RespondWith(
                    Response.Create()
                        .WithStatusCode(200)
                        .WithBody(html)
                        .WithHeader(HeaderNames.ContentType, MediaTypeNames.Text.Html)
                );
        }

        foreach ((string path, byte[]? audio) in data.AudioFiles)
        {
            IRequestBuilder request = Request.Create().WithPath($"/{path}").UsingGet();

            if (data.ShouldFail || audio is null)
            {
                int statusCode = data.ShouldFail
                    ? StatusCodes.Status500InternalServerError
                    : StatusCodes.Status404NotFound;
                _server.Given(request).RespondWith(Response.Create().WithStatusCode(statusCode));

                continue;
            }

            _server
                .Given(request)
                .RespondWith(
                    Response.Create()
                        .WithStatusCode(200)
                        .WithBody(audio)
                        .WithHeader(HeaderNames.ContentType, CustomMediaTypes.Audio.Mpeg)
                );
        }

        Factory = Factory.WithCustomOptions(
            new Dictionary<string, string?>
            {
                ["EnglishDictionary:BaseUrl"] = _server.Url,
                ["EnglishDictionary:Path"] = "/{word}"
            }
        );

        return Task.CompletedTask;
    }
}
