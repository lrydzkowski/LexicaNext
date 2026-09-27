using System.Collections.Specialized;
using System.Net;
using System.Web;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetWordsTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetWordsTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    public static TheoryData<int> CorrectTestCases =>
        new(CorrectTestCasesGenerator.Generate().Select(testCase => testCase.TestCaseId));

    [Theory]
    [MemberData(nameof(CorrectTestCases))]
    public async Task GetWords_ShouldBeSuccessful(int testCaseId)
    {
        TestCaseData testCase = CorrectTestCasesGenerator.Generate().Single(testCase => testCase.TestCaseId == testCaseId);
        GetWordsTestResult result = await RunAsync(testCase);

        await Verify(result, _verifySettings).UseParameters(testCaseId);
    }

    public static TheoryData<int> IncorrectTestCases =>
        new(IncorrectTestCasesGenerator.Generate().Select(testCase => testCase.TestCaseId));

    [Theory]
    [MemberData(nameof(IncorrectTestCases))]
    public async Task GetWords_ShouldBeUnsuccessful(int testCaseId)
    {
        TestCaseData testCase = IncorrectTestCasesGenerator.Generate().Single(testCase => testCase.TestCaseId == testCaseId);
        GetWordsTestResult result = await RunAsync(testCase);

        await Verify(result, _verifySettings).UseParameters(testCaseId);
    }

    private async Task<GetWordsTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<WordEntity> dbWords = await contextScope.Db!.Context.GetWordsAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        string url = BuildUrl(testCase);
        using HttpResponseMessage response = await client.GetAsync(url, TestContext.Current.CancellationToken);

        string responseBody = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        return new GetWordsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Url = url,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbWords = dbWords,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private static string BuildUrl(TestCaseData testCase)
    {
        NameValueCollection queryParams = HttpUtility.ParseQueryString(string.Empty);

        if (testCase.Page.HasValue)
        {
            queryParams["page"] = testCase.Page.Value.ToString();
        }

        if (testCase.PageSize.HasValue)
        {
            queryParams["pageSize"] = testCase.PageSize.Value.ToString();
        }

        if (testCase.SortingFieldName is not null)
        {
            queryParams["sortingFieldName"] = testCase.SortingFieldName;
        }

        if (testCase.SortingOrder is not null)
        {
            queryParams["sortingOrder"] = testCase.SortingOrder;
        }

        if (testCase.SearchQuery is not null)
        {
            queryParams["searchQuery"] = testCase.SearchQuery;
        }

        if (testCase.TimeZoneId is not null)
        {
            queryParams["timeZoneId"] = testCase.TimeZoneId;
        }

        string query = queryParams.ToString()!;

        return string.IsNullOrEmpty(query) ? "/api/words" : $"/api/words?{query}";
    }

    private class GetWordsTestResult : IHttpTestResult
    {
        public List<WordEntity> DbWords { get; init; } = [];

        public string? Url { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
