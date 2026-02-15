using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Data.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class UpdateWordTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public UpdateWordTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task UpdateWord_ShouldBeSuccessful()
    {
        List<UpdateWordTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task UpdateWord_ShouldBeUnsuccessful()
    {
        List<UpdateWordTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<UpdateWordTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        List<WordEntity> wordsBefore = await contextScope.Db.Context.GetWordsAsync();

        HttpClient client = webApiFactory.CreateClient();
        string url = $"/api/words/{testCase.WordId}";
        using HttpRequestMessage request = new(HttpMethod.Put, url);
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        List<WordEntity> wordsAfter = await contextScope.Db.Context.GetWordsAsync();

        return new UpdateWordTestResult
        {
            TestCaseId = testCase.TestCaseId,
            WordId = testCase.WordId,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbWordsBefore = wordsBefore,
            DbWordsAfter = wordsAfter,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class UpdateWordTestResult : IHttpTestResult
    {
        public List<WordEntity> DbWordsBefore { get; init; } = [];

        public List<WordEntity> DbWordsAfter { get; init; } = [];

        public string? WordId { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
