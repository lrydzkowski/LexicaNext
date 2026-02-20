namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

internal static class CorrectTestCasesGenerator
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
        yield return TestCase09.Get();
    }
}
