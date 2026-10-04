using System.Net;
using LexicaNext.Core.Features.Words.DeleteWords;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class DeleteWordsTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public DeleteWordsTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    public static TheoryData<int> CorrectTestCases =>
        new(CorrectTestCasesGenerator.Generate().Select(testCase => testCase.TestCaseId));

    [Theory]
    [MemberData(nameof(CorrectTestCases))]
    public async Task DeleteWords_ShouldBeSuccessful(int testCaseId)
    {
        TestCaseData testCase = CorrectTestCasesGenerator.Generate().Single(testCase => testCase.TestCaseId == testCaseId);
        DeleteWordsTestResult result = await RunAsync(testCase);

        await Verify(result, _verifySettings).UseParameters(testCaseId);
    }

    public static TheoryData<int> IncorrectTestCases =>
        new(IncorrectTestCasesGenerator.Generate().Select(testCase => testCase.TestCaseId));

    [Theory]
    [MemberData(nameof(IncorrectTestCases))]
    public async Task DeleteWords_ShouldBeUnsuccessful(int testCaseId)
    {
        TestCaseData testCase = IncorrectTestCasesGenerator.Generate().Single(testCase => testCase.TestCaseId == testCaseId);
        DeleteWordsTestResult result = await RunAsync(testCase);

        await Verify(result, _verifySettings).UseParameters(testCaseId);
    }

    private async Task<DeleteWordsTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<WordEntity> wordsBefore = await contextScope.Db!.Context.GetWordsAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        DeleteWordsRequest requestBody = new() { Ids = testCase.Ids };
        using HttpRequestMessage request = new(HttpMethod.Delete, "/api/words");
        request.CreateContent(requestBody);
        using HttpResponseMessage response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        string responseBody = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        List<WordEntity> wordsAfter = await contextScope.Db!.Context.GetWordsAsync();

        return new DeleteWordsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            StatusCode = response.StatusCode,
            DbWordsBefore = wordsBefore,
            DbWordsAfter = wordsAfter,
            Request = requestBody,
            Response = responseBody.PrettifyJson(6),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class DeleteWordsTestResult : ITestResult
    {
        public HttpStatusCode StatusCode { get; init; }

        public List<WordEntity> DbWordsBefore { get; init; } = [];

        public List<WordEntity> DbWordsAfter { get; init; } = [];

        public DeleteWordsRequest? Request { get; init; }

        public string? Response { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }
    }
}
