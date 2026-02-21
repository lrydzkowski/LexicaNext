using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data;

internal class TestCaseData : ITestCaseData
{
    public RegisterAnswerRequestPayload? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
