using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Sort ascending by createdAt. Expected: 200 OK with sets sorted oldest first.
internal static class TestCase08
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 8,
            SortingFieldName = "createdAt",
            SortingOrder = "asc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0003",
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0002",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
