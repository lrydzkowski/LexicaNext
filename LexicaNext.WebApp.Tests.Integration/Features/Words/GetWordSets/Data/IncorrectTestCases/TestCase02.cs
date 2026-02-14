namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWordSets.Data.IncorrectTestCases;

// Invalid word ID format (not a GUID). Expected: 404 Not Found.
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
