using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetSetTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetSetTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GetSet_ShouldBeSuccessful()
    {
        List<GetSetTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GetSet_ShouldBeUnsuccessful()
    {
        List<GetSetTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetSetTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<SetEntity> dbSets = await contextScope.Db!.Context.GetSetsAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        using HttpResponseMessage response = await client.GetAsync($"/api/sets/{testCase.SetId}");

        string responseBody = await response.Content.ReadAsStringAsync();

        return new GetSetTestResult
        {
            TestCaseId = testCase.TestCaseId,
            SetId = testCase.SetId,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbSets = dbSets,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GetSetTestResult : IHttpTestResult
    {
        public List<SetEntity> DbSets { get; init; } = [];

        public string? SetId { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
