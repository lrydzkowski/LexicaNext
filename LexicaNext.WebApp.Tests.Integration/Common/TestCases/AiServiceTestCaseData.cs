namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class AiServiceTestCaseData
{
    public List<string> Responses { get; init; } = [];

    public bool ShouldThrowException { get; init; }
}
