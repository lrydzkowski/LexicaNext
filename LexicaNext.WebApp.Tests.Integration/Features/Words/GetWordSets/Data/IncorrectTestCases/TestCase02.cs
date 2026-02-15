namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWordSets.Data.IncorrectTestCases;

// Invalid word ID format (not a GUID). Expected: empty list.
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
