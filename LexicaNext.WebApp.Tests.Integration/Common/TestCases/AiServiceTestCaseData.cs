namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class AiServiceTestCaseData
{
    public List<string>? Translations { get; init; }

    public List<string>? Sentences { get; init; }

    public bool ShouldThrowException { get; init; }
}
