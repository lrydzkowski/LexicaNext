using System.Net;
using LexicaNext.Core.Commands.DeleteSets;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class DeleteSetsTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public DeleteSetsTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task DeleteSets_ShouldBeSuccessful()
    {
        List<DeleteSetsTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task DeleteSets_ShouldBeUnsuccessful()
    {
        List<DeleteSetsTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<DeleteSetsTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<SetEntity> setsBefore = await contextScope.Db!.Context.GetSetsAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        DeleteSetsRequest requestBody = new() { Ids = testCase.Ids };
        using HttpRequestMessage request = new(HttpMethod.Delete, "/api/sets");
        request.CreateContent(requestBody);
        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        List<SetEntity> setsAfter = await contextScope.Db!.Context.GetSetsAsync();

        return new DeleteSetsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            StatusCode = response.StatusCode,
            DbSetsBefore = setsBefore,
            DbSetsAfter = setsAfter,
            Request = requestBody,
            Response = responseBody,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class DeleteSetsTestResult : ITestResult
    {
        public HttpStatusCode StatusCode { get; init; }

        public List<SetEntity> DbSetsBefore { get; init; } = [];

        public List<SetEntity> DbSetsAfter { get; init; } = [];

        public DeleteSetsRequest? Request { get; init; }

        public string? Response { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }
    }
}
