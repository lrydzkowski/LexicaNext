namespace LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data.IncorrectTestCases;

// Empty IDs list. Expected: 400 Bad Request.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Ids = []
        };
    }
}
