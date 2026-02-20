using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetProposedSetName.Data.CorrectTestCases;

// With existing UserSetSequence where next=5. Expected: 200 OK with "set_000005".
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    UserSetSequences =
                    [
                        new UserSetSequenceEntity
                        {
                            UserSetSequenceId = Guid.NewGuid(),
                            UserId = "test-user-id",
                            NextValue = 5,
                            LastUpdated = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
