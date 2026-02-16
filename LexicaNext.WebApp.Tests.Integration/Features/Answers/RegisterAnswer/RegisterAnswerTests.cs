using System.Net;
using LexicaNext.Core.Commands.RegisterAnswer;
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
using LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class RegisterAnswerTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;

    public RegisterAnswerTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task RegisterAnswer_ShouldBeSuccessful()
    {
        List<RegisterAnswerTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task RegisterAnswer_ShouldBeUnsuccessful()
    {
        List<RegisterAnswerTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<RegisterAnswerTestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory = _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        List<AnswerEntity> answersBefore = await contextScope.Db.Context.GetAnswersAsync();

        HttpClient client = webApiFactory.CreateClient();
        using HttpRequestMessage request = new(HttpMethod.Post, "/api/answer");
        if (testCase.RequestBody is not null)
        {
            request.CreateContent(testCase.RequestBody);
        }

        using HttpResponseMessage response = await client.SendAsync(request);

        string responseBody = await response.Content.ReadAsStringAsync();

        List<AnswerEntity> answersAfter = await contextScope.Db.Context.GetAnswersAsync();

        return new RegisterAnswerTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Request = testCase.RequestBody,
            StatusCode = response.StatusCode,
            Response = responseBody.PrettifyJson(4),
            DbAnswersBefore = answersBefore,
            DbAnswersAfter = answersAfter,
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class RegisterAnswerTestResult : IHttpTestResult
    {
        public List<AnswerEntity> DbAnswersBefore { get; init; } = [];

        public List<AnswerEntity> DbAnswersAfter { get; init; } = [];

        public RegisterAnswerRequestPayload? Request { get; set; }

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? Response { get; init; }
    }
}
