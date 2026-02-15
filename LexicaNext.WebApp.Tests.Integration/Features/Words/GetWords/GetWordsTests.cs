using System.Collections.Specialized;
using System.Net;
using System.Web;
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

    [Fact]
    public async Task GetWords_ShouldBeSuccessful()
    {
        List<GetWordsTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GetWords_ShouldBeUnsuccessful()
    {
        List<GetWordsTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetWordsTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        List<WordEntity> dbWords = await contextScope.Db.Context.GetWordsAsync();

        HttpClient client = webApiFactory.CreateClient();
        string url = BuildUrl(testCase);
        using HttpResponseMessage response = await client.GetAsync(url);

        string responseBody = await response.Content.ReadAsStringAsync();

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
