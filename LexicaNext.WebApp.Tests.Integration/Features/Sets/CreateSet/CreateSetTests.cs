using System.Net;
using LexicaNext.Core.Commands.CreateSet;
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
using LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class CreateSetTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public CreateSetTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task CreateSet_ShouldBeSuccessful()
    {
        List<CreateSetTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task CreateSet_ShouldBeUnsuccessful()
    {
        List<CreateSetTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<CreateSetTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        List<SetEntity> setsBefore = await contextScope.Db.Context.GetSetsAsync();

        HttpClient client = webApiFactory.CreateClient();
        using HttpRequestMessage request = new(HttpMethod.Post, "/api/sets");
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        List<SetEntity> setsAfter = await contextScope.Db.Context.GetSetsAsync();

        return new CreateSetTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Request = testCase.RequestBody,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbSetsBefore = setsBefore,
            DbSetsAfter = setsAfter,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class CreateSetTestResult : IHttpTestResult
    {
        public List<SetEntity> DbSetsBefore { get; init; } = [];

        public List<SetEntity> DbSetsAfter { get; init; } = [];

        public CreateSetRequestPayload? Request { get; set; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
