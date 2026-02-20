using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetProposedSetName.Data.CorrectTestCases;

// No existing sets or sequence. Expected: 200 OK with "set_000001".
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Data = new BaseTestCaseData()
        };
    }
}
