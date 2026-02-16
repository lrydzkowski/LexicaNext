using System.Net;
using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GenerateExampleSentencesTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GenerateExampleSentencesTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GenerateExampleSentences_ShouldBeSuccessful()
    {
        List<GenerateExampleSentencesTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GenerateExampleSentences_ShouldBeUnsuccessful()
    {
        List<GenerateExampleSentencesTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GenerateExampleSentencesTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        using HttpRequestMessage request = new(HttpMethod.Post, "/api/sentences/generate");
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        return new GenerateExampleSentencesTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Request = testCase.RequestBody,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GenerateExampleSentencesTestResult : IHttpTestResult
    {
        public GenerateExampleSentencesRequest? Request { get; set; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
