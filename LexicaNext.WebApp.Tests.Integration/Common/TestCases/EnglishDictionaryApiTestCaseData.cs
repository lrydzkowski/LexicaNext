namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class EnglishDictionaryApiTestCaseData
{
    public Dictionary<string, string?> WordPages { get; init; } = new();

    public Dictionary<string, byte[]?> AudioFiles { get; init; } = new();

    public bool ShouldFail { get; init; }
}
