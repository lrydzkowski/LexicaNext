namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.IncorrectTestCases;

internal static class IncorrectTestCasesGenerator
{
    public static IEnumerable<TestCaseData> Generate()
    {
        yield return TestCase01.Get();
    }
}
