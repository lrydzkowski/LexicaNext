namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWord.Data.CorrectTestCases;

internal static class CorrectTestCasesGenerator
{
    public static IEnumerable<TestCaseData> Generate()
    {
        yield return TestCase01.Get();
        yield return TestCase02.Get();
    }
}
