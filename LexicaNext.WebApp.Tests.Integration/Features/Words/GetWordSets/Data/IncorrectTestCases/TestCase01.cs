namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWordSets.Data.IncorrectTestCases;

// Non-existent word ID. Expected: empty list.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            WordId = Guid.NewGuid().ToString()
        };
    }
}
