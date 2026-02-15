using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWord.Data.CorrectTestCases;

// Existing word with translations, example sentences, and updated at value. Expected: 200 OK.
internal static class TestCase02
{
    private static readonly Guid WordId = Guid.NewGuid();
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
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 2, 5, 8, 10, 0, TimeSpan.Zero)
                        }
                    ],
                    Translations =
                    [
                        new TranslationEntity
                        {
                            TranslationId = Guid.NewGuid(),
                            Translation = "jabłko",
                            Order = 1,
                            WordId = WordId
                        },
                        new TranslationEntity
                        {
                            TranslationId = Guid.NewGuid(),
                            Translation = "jabłoń",
                            Order = 2,
                            WordId = WordId
                        }
                    ],
                    ExampleSentences =
                    [
                        new ExampleSentenceEntity
                        {
                            ExampleSentenceId = Guid.NewGuid(),
                            Sentence = "I ate a red apple for breakfast.",
                            Order = 1,
                            WordId = WordId
                        }
                    ]
                }
            }
        };
    }
}
