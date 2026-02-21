using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Sort descending by name. Expected: 200 OK with sets sorted Z-A.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            SortingFieldName = "name",
            SortingOrder = "desc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "charlie_set",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "alpha_set",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "bravo_set",
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
