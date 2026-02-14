using LexicaNext.Core.Commands.CreateWord;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data;

internal class TestCaseData : ITestCaseData
{
    public CreateWordRequestPayload? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
