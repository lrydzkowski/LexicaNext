using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWordSets.Data.CorrectTestCases;

// Word belongs to multiple sets. Expected: 200 OK with both sets.
internal static class TestCase01
{
    private static readonly Guid WordId = Guid.NewGuid();
    private static readonly Guid SetId1 = Guid.NewGuid();
    private static readonly Guid SetId2 = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            WordId = WordId.ToString(),
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId1,
                            UserId = "test-user-id",
                            Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = SetId2,
                            UserId = "test-user-id",
                            Name = "set_0002",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = SetId1, WordId = WordId, Order = 1 },
                        new SetWordEntity { SetId = SetId2, WordId = WordId, Order = 1 }
                    ]
                }
            }
        };
    }
}
