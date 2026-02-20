namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWordSets.Data.IncorrectTestCases;

internal static class IncorrectTestCasesGenerator
{
    public static IEnumerable<TestCaseData> Generate()
    {
        yield return TestCase01.Get();
        yield return TestCase02.Get();
        yield return TestCase03.Get();
    }
}
