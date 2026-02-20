namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWord.Data.IncorrectTestCases;

// Non-existent word ID. Expected: 404 Not Found.
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
