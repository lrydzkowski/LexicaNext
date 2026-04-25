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
using LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetWordsStatisticsTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetWordsStatisticsTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GetWordsStatistics_ShouldBeSuccessful()
    {
        List<GetWordsStatisticsTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GetWordsStatistics_ShouldBeUnsuccessful()
    {
        List<GetWordsStatisticsTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetWordsStatisticsTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<AnswerEntity> dbAnswers = await contextScope.Db!.Context.GetAnswersAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        string url = BuildUrl(testCase);
        using HttpResponseMessage response = await client.GetAsync(url);

        string responseBody = await response.Content.ReadAsStringAsync();

        return new GetWordsStatisticsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Url = url,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
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

        return string.IsNullOrEmpty(query) ? "/api/words-statistics" : $"/api/words-statistics?{query}";
    }

    private class GetWordsStatisticsTestResult : IHttpTestResult
    {
        public string? Url { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
