namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.IncorrectTestCases;

internal static class IncorrectTestCasesGenerator
{
    public static IEnumerable<TestCaseData> Generate()
    {
        yield return TestCase01.Get();
        yield return TestCase02.Get();
        yield return TestCase03.Get();
        yield return TestCase04.Get();
        yield return TestCase05.Get();
        yield return TestCase06.Get();
        yield return TestCase07.Get();
        yield return TestCase08.Get();
    }
}
