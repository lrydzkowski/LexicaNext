namespace LexicaNext.WebApp.Tests.Integration.Features.Words.DeleteWords.Data.CorrectTestCases;

// Delete with non-existent word IDs (no words in DB). Expected: 204 No Content.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            Ids = [Guid.NewGuid().ToString(), Guid.NewGuid().ToString()]
        };
    }
}
