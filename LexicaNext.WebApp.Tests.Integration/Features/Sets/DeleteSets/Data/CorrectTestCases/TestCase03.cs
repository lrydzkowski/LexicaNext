using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.CorrectTestCases;

// Delete set IDs assigned to other users. Expected: 204, other user's sets unchanged.
internal static class TestCase03
{
    private static readonly Guid SetId1 = Guid.NewGuid();
    private static readonly Guid SetId2 = Guid.NewGuid();

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            Ids = [SetId1.ToString(), SetId2.ToString()],
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId1, UserId = "other-user-id", Name = "other_set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = SetId2, UserId = "other-user-id", Name = "other_set_0002",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
