using System.Net.Mime;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;

internal static class EnglishDictionaryApiBuilder
{
    public static void Configure(WireMockServer server, EnglishDictionaryApiTestCaseData data)
    {
        server.Reset();

        foreach ((string word, string? html) in data.WordPages)
        {
            IRequestBuilder request = Request.Create().WithPath($"/{word}").UsingGet();

            if (data.ShouldFail || html is null)
            {
                int statusCode = data.ShouldFail
                    ? StatusCodes.Status500InternalServerError
                    : StatusCodes.Status404NotFound;
                server.Given(request).RespondWith(Response.Create().WithStatusCode(statusCode));

                continue;
            }

            server
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
                server.Given(request).RespondWith(Response.Create().WithStatusCode(statusCode));

                continue;
            }

            server
                .Given(request)
                .RespondWith(
                    Response.Create()
                        .WithStatusCode(200)
                        .WithBody(audio)
                        .WithHeader(HeaderNames.ContentType, CustomMediaTypes.Audio.Mpeg)
                );
        }
    }
}
