using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.CorrectTestCases;

// Update with new word IDs. Expected: 204 No Content.
internal static class TestCase01
{
    private static readonly Guid SetId = Guid.NewGuid();
    private static readonly Guid WordId1 = Guid.NewGuid();
    private static readonly Guid WordId2 = Guid.NewGuid();
    private static readonly Guid WordId3 = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            SetId = SetId.ToString(),
            RequestBody = new UpdateSetRequestPayload
            {
                WordIds = [WordId2.ToString(), WordId3.ToString()]
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId1, UserId = "test-user-id", Word = "apple", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = WordId2, UserId = "test-user-id", Word = "banana", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 11, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = WordId3, UserId = "test-user-id", Word = "cherry", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 12, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = SetId, WordId = WordId1, Order = 1 }
                    ]
                }
            }
        };
    }
}
