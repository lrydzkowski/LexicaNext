using System.Net;
using LexicaNext.Core.Commands.DeleteWords;
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

    [Fact]
    public async Task DeleteWords_ShouldBeSuccessful()
    {
        List<DeleteWordsTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task DeleteWords_ShouldBeUnsuccessful()
    {
        List<DeleteWordsTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<DeleteWordsTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        DeleteWordsRequest requestBody = new() { Ids = testCase.Ids };
        using HttpRequestMessage request = new(HttpMethod.Delete, "/api/words");
        request.CreateContent(requestBody);
        using HttpResponseMessage response = await client.SendAsync(request);

        List<WordEntity> remainingWords =
            await contextScope.Db.Context.GetWordsAsync();

        return new DeleteWordsTestResult
        {
            TestCaseId = testCase.TestCaseId,
            StatusCode = response.StatusCode,
            RemainingWordsCount = remainingWords.Count
        };
    }

    private class DeleteWordsTestResult : ITestResult
    {
        public HttpStatusCode StatusCode { get; init; }

        public int RemainingWordsCount { get; init; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }
    }
}
