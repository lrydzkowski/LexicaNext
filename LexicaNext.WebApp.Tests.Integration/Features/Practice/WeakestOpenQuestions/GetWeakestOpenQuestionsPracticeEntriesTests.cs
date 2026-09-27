using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetWeakestOpenQuestionsPracticeEntriesTests
{
    private const string Url = "/api/practice/open-questions/weakest";

    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetWeakestOpenQuestionsPracticeEntriesTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    public static TheoryData<int> CorrectTestCases =>
        new(CorrectTestCasesGenerator.Generate().Select(testCase => testCase.TestCaseId));

    [Theory]
    [MemberData(nameof(CorrectTestCases))]
    public async Task GetWeakestOpenQuestionsPracticeEntries_ShouldBeSuccessful(int testCaseId)
    {
        TestCaseData testCase = CorrectTestCasesGenerator.Generate().Single(testCase => testCase.TestCaseId == testCaseId);
        GetWeakestOpenQuestionsPracticeEntriesTestResult result = await RunAsync(testCase);

        await Verify(result, _verifySettings).UseParameters(testCaseId);
    }

    private async Task<GetWeakestOpenQuestionsPracticeEntriesTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        HttpClient client = contextScope.Factory.CreateClient();
        using HttpResponseMessage response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        string responseBody = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        return new GetWeakestOpenQuestionsPracticeEntriesTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Url = Url,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GetWeakestOpenQuestionsPracticeEntriesTestResult : IHttpTestResult
    {
        public string? Url { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
