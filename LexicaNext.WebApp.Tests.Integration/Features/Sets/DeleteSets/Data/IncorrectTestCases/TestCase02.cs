namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.IncorrectTestCases;

// Too many IDs (101). Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            Ids = Enumerable.Range(1, 101).Select(i => Guid.NewGuid().ToString()).ToList()
        };
    }
}
