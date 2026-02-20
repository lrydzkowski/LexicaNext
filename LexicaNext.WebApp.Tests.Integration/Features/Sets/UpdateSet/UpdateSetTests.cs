using System.Net;
using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Context;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class UpdateSetTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public UpdateSetTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task UpdateSet_ShouldBeSuccessful()
    {
        List<UpdateSetTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task UpdateSet_ShouldBeUnsuccessful()
    {
        List<UpdateSetTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<UpdateSetTestResult> RunAsync(TestCaseData testCase)
    {
        await using TestContextScope contextScope = new(_webApiFactory, _logMessages);
        await contextScope.InitializeAsync(testCase);

        List<SetEntity> setsBefore = await contextScope.Db!.Context.GetSetsAsync();

        HttpClient client = contextScope.Factory.CreateClient();
        string url = $"/api/sets/{testCase.SetId}";
        using HttpRequestMessage request = new(HttpMethod.Put, url);
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        List<SetEntity> setsAfter = await contextScope.Db!.Context.GetSetsAsync();

        return new UpdateSetTestResult
        {
            TestCaseId = testCase.TestCaseId,
            SetId = testCase.SetId,
            Request = testCase.RequestBody,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbSetsBefore = setsBefore,
            DbSetsAfter = setsAfter,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class UpdateSetTestResult : IHttpTestResult
    {
        public List<SetEntity> DbSetsBefore { get; init; } = [];

        public List<SetEntity> DbSetsAfter { get; init; } = [];

        public string? SetId { get; init; }

        public UpdateSetRequestPayload? Request { get; set; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
