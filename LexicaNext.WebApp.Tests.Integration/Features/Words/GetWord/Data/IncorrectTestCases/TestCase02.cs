namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWord.Data.IncorrectTestCases;

internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            WordId = "not-a-valid-uuid"
        };
    }
}
