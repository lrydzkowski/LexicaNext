using System.Net;
using System.Text.Json;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetRandomOpenQuestionsPracticeEntriesTests
{
    private const string Url = "/api/practice/open-questions/random";

    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetRandomOpenQuestionsPracticeEntriesTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GetRandomOpenQuestionsPracticeEntries_ShouldBeSuccessful()
    {
        List<GetRandomOpenQuestionsPracticeEntriesTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetRandomOpenQuestionsPracticeEntriesTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        HttpClient client = contextScope.Factory.CreateClient();
        using HttpResponseMessage response = await client.GetAsync(Url);

        string responseBody = await response.Content.ReadAsStringAsync();
        ResponsePayload? payload = JsonSerializer.Deserialize<ResponsePayload>(
            responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        List<Guid> returnedWordIds = payload?.Entries.Select(e => e.WordId).ToList() ?? [];
        bool allInPool = testCase.ExpectedWordIdPool.Count == 0
            ? returnedWordIds.Count == 0
            : returnedWordIds.All(id => testCase.ExpectedWordIdPool.Contains(id));

        return new GetRandomOpenQuestionsPracticeEntriesTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Url = Url,
            StatusCode = response.StatusCode,
            ExpectedCount = testCase.ExpectedCount,
            ActualCount = returnedWordIds.Count,
            AllReturnedWordIdsAreInExpectedPool = allInPool,
            ReturnedWordIdsSorted = returnedWordIds.OrderBy(id => id).ToList(),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GetRandomOpenQuestionsPracticeEntriesTestResult : IHttpTestResult
    {
        public string? Url { get; init; }

        public int ExpectedCount { get; init; }

        public int ActualCount { get; init; }

        public bool AllReturnedWordIdsAreInExpectedPool { get; init; }

        public List<Guid> ReturnedWordIdsSorted { get; init; } = [];

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }

    private class ResponsePayload
    {
        public List<EntryPayload> Entries { get; init; } = [];
    }

    private class EntryPayload
    {
        public Guid WordId { get; init; }
    }
}
