using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// Default parameters with words and translations. Expected: 200 OK with all user's words.
internal static class TestCase01
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");
    private static readonly Guid AdjectiveTypeId = Guid.Parse("0196294e-9a78-7573-9db1-47b3d0ee9eae");

    public static TestCaseData Get()
    {
        Guid wordId1 = Guid.NewGuid();
        Guid wordId2 = Guid.NewGuid();
        Guid wordId3 = Guid.NewGuid();

        return new TestCaseData
        {
            TestCaseId = 1,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordId1,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = wordId2,
                            UserId = "test-user-id",
                            Word = "run",
                            WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = wordId3,
                            UserId = "test-user-id",
                            Word = "bright",
                            WordTypeId = AdjectiveTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Translations =
                    [
                        new TranslationEntity
                            { TranslationId = Guid.NewGuid(), Translation = "jabłko", Order = 1, WordId = wordId1 },
                        new TranslationEntity
                            { TranslationId = Guid.NewGuid(), Translation = "biegać", Order = 1, WordId = wordId2 },
                        new TranslationEntity
                            { TranslationId = Guid.NewGuid(), Translation = "jasny", Order = 1, WordId = wordId3 }
                    ]
                }
            }
        };
    }
}
