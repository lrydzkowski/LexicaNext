using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.GetProposedSetName.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Sets.GetProposedSetName.Data.CorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetProposedSetName;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetProposedSetNameTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public GetProposedSetNameTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task GetProposedSetName_ShouldBeSuccessful()
    {
        List<GetProposedSetNameTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetProposedSetNameTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.InitializeAppAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        using HttpResponseMessage response = await client.GetAsync("/api/sets/proposed-name");

        string responseBody = await response.Content.ReadAsStringAsync();

        return new GetProposedSetNameTestResult
        {
            TestCaseId = testCase.TestCaseId,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GetProposedSetNameTestResult : IHttpTestResult
    {
        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
