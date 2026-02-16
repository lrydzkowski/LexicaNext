using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Empty result - no sets for this user. Expected: 200 OK with empty list.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            Data = new BaseTestCaseData()
        };
    }
}
