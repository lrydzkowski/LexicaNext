using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data;

internal class TestCaseData : ITestCaseData
{
    public int ExpectedCount { get; init; }

    public List<Guid> ExpectedWordIdPool { get; init; } = [];

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
