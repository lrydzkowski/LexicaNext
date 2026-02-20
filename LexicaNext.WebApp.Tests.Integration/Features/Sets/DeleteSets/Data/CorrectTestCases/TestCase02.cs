namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.CorrectTestCases;

// Delete non-existent IDs. Expected: 204 (idempotent).
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
