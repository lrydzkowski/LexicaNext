using LexicaNext.Core.Commands.UpdateWord;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.IncorrectTestCases;

// Update would create duplicate word and word type combination. Expected: 400 Bad Request.
internal static class TestCase10
{
    private static readonly Guid WordId1 = Guid.NewGuid();
    private static readonly Guid WordId2 = Guid.NewGuid();
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 10,
            WordId = WordId2.ToString(),
            RequestBody = new UpdateWordRequestPayload
            {
                Word = "run",
                WordType = "verb",
                Translations = ["biegać"],
                ExampleSentences = []
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId1,
                            UserId = "test-user-id",
                            Word = "run",
                            WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = WordId2,
                            UserId = "test-user-id",
                            Word = "walk",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
