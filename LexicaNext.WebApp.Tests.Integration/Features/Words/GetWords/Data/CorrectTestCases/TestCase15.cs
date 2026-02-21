using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// Filter by updatedAt with America/Los_Angeles timezone (PST = UTC-8 in January).
// searchQuery "2025-01-15" should match bravo and charlie after timezone conversion.
// createdAt set to 2025-06-xx so it won't match the search query.
internal static class TestCase15
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 15,
            SearchQuery = "2025-01-15",
            TimeZoneId = "America/Los_Angeles",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "alpha", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 6, 1, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 1, 15, 7, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "bravo", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 6, 2, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 1, 15, 8, 30, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "charlie", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 6, 3, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 1, 15, 20, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "delta", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 6, 4, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
