using LexicaNext.Core.Commands.CreateSet;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.IncorrectTestCases;

// Empty word IDs list. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new CreateSetRequestPayload
            {
                WordIds = []
            }
        };
    }
}
