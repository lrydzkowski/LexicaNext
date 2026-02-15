using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// Filter by createdAt with Europe/Warsaw timezone (CET = UTC+1 in January).
// searchQuery "2025-01-15" should match bravo and charlie after timezone conversion.
internal static class TestCase12
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 12,
            SearchQuery = "2025-01-15",
            TimeZoneId = "Europe/Warsaw",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "alpha", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 14, 22, 30, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "bravo", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 14, 23, 30, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "charlie", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "delta", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 5, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
