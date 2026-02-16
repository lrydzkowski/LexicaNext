using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data;

internal class TestCaseData : ITestCaseData
{
    public GenerateExampleSentencesRequest? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
