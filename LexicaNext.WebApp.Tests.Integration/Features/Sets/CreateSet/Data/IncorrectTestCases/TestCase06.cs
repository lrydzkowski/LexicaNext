using LexicaNext.Core.Commands.CreateSet;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.IncorrectTestCases;

// Word IDs assigned to other users. Expected: 400 Bad Request.
internal static class TestCase06
{
    private static readonly Guid WordId1 = Guid.NewGuid();
    private static readonly Guid WordId2 = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new CreateSetRequestPayload
            {
                WordIds = [WordId1.ToString(), WordId2.ToString()]
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId1, UserId = "other-user-id", Word = "apple", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = WordId2, UserId = "other-user-id", Word = "banana", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 11, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
