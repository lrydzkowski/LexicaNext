using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Search query matches set name. Expected: 200 OK with filtered list.
internal static class TestCase02
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordId = Guid.NewGuid();

        return new TestCaseData
        {
            TestCaseId = 2,
            SearchQuery = "0002",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordId, UserId = "test-user-id", Word = "apple", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0002",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_0003",
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
