namespace LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data.IncorrectTestCases;

internal static class IncorrectTestCasesGenerator
{
    public static IEnumerable<TestCaseData> Generate()
    {
        yield return TestCase01.Get();
    }
}
