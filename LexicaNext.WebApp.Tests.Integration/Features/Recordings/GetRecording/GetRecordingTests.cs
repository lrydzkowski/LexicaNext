using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Queries.GetRecording.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common;
using LexicaNext.WebApp.Tests.Integration.Common.Data;
using LexicaNext.WebApp.Tests.Integration.Common.Data.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Extensions;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Models;
using LexicaNext.WebApp.Tests.Integration.Common.TestCollections;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;
using LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data;
using LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.CorrectTestCases;
using LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.IncorrectTestCases;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording;

[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class GetRecordingTests
{
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;
    private readonly WebApplicationFactory<Program> _webApiFactory;
    private readonly WireMockServer _wireMockServer;

    public GetRecordingTests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
        _wireMockServer = webApiFactory.WireMockServer;
    }

    [Fact]
    public async Task GetRecording_ShouldBeSuccessful()
    {
        List<GetRecordingTestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task GetRecording_ShouldBeUnsuccessful()
    {
        List<GetRecordingTestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }

        await Verify(results, _verifySettings);
    }

    private async Task<GetRecordingTestResult> RunAsync(TestCaseData testCase)
    {
        IRecordingStorage recordingStorageMock = Substitute.For<IRecordingStorage>();
        foreach ((string fileName, byte[]? bytes) in testCase.RecordingStorageFiles)
        {
            recordingStorageMock.GetFileAsync(fileName, Arg.Any<CancellationToken>()).Returns(bytes);
        }

        WebApplicationFactory<Program> webApiFactory = _webApiFactory
            .WithDependencies(testCase, _wireMockServer)
            .WithCustomOptions(
                new Dictionary<string, string?>
                {
                    ["EnglishDictionary:BaseUrl"] = _wireMockServer.Url,
                    ["EnglishDictionary:Path"] = "/{word}"
                }
            )
            .ReplaceService(recordingStorageMock, ServiceLifetime.Scoped);

        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.InitializeAppAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        string url = $"/api/recordings/{testCase.Word}";
        if (testCase.WordType is not null)
        {
            url += $"?wordType={testCase.WordType}";
        }

        using HttpResponseMessage response = await client.GetAsync(url);

        byte[]? responseBytes = response.IsSuccessStatusCode
            ? await response.Content.ReadAsByteArrayAsync()
            : null;
        string? responseBody = !response.IsSuccessStatusCode
            ? (await response.Content.ReadAsStringAsync()).PrettifyJson(4)
            : null;

        List<RecordingEntity> dbRecordings = await contextScope.Db.Context.GetRecordingsAsync();

        return new GetRecordingTestResult
        {
            TestCaseId = testCase.TestCaseId,
            Word = testCase.Word,
            WordType = testCase.WordType,
            StatusCode = response.StatusCode,
            ContentType = response.Content.Headers.ContentType?.MediaType,
            ResponseSize = responseBytes?.Length,
            Response = responseBody,
            DbRecordings = dbRecordings,
            RecordingStorageCalls = recordingStorageMock.GetReceivedMethodCalls(),
            LogMessages = contextScope.LogMessages.GetSerialized(6)
        };
    }

    private class GetRecordingTestResult : ITestResult
    {
        public string? Word { get; init; }

        public string? WordType { get; init; }

        public HttpStatusCode StatusCode { get; init; }

        public string? ContentType { get; init; }

        public int? ResponseSize { get; init; }

        public string? Response { get; init; }

        public List<RecordingEntity> DbRecordings { get; init; } = [];

        public List<ReceivedMethodCall> RecordingStorageCalls { get; init; } = [];

        public int TestCaseId { get; init; }

        public string? LogMessages { get; init; }
    }
}
