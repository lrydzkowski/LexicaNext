using System.Net;
using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GenerateTranslationsTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GenerateTranslationsTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GenerateTranslations_ShouldBeSuccessful()
    {
        List<GenerateTranslationsTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GenerateTranslations_ShouldBeUnsuccessful()
    {
        List<GenerateTranslationsTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GenerateTranslationsTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        using HttpRequestMessage request = new(HttpMethod.Post, "/api/translations/generate");
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        return new GenerateTranslationsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Request = testCase.RequestBody,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GenerateTranslationsTestResult : IHttpTestResult
    {
        public GenerateTranslationsRequest? Request { get; set; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
