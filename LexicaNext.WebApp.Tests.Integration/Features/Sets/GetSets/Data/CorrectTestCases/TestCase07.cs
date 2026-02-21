using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Filter by createdAt with America/Los_Angeles timezone (PST = UTC-8 in January).
// searchQuery "2025-01-15" should match bravo and charlie after timezone conversion.
internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            SearchQuery = "2025-01-15",
            TimeZoneId = "America/Los_Angeles",
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
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_alpha",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 7, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_bravo",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 8, 30, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_charlie",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 20, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_delta",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
