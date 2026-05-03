using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// Tiebreaker — three words with the same ratio (0.50). Expected order by IncorrectCount desc:
// big:    3 correct, 3 incorrect (ratio 0.5, incorrect=3)
// medium: 2 correct, 2 incorrect (ratio 0.5, incorrect=2)
// small:  1 correct, 1 incorrect (ratio 0.5, incorrect=1)
internal static class TestCase03
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid bigId = Guid.Parse("0199e882-1000-7000-8000-000000000001");
        Guid mediumId = Guid.Parse("0199e882-1000-7000-8000-000000000002");
        Guid smallId = Guid.Parse("0199e882-1000-7000-8000-000000000003");

        return new TestCaseData
        {
            TestCaseId = 3,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(bigId, "big"),
                        MakeWord(mediumId, "medium"),
                        MakeWord(smallId, "small")
                    ],
                    Translations =
                    [
                        MakeTranslation("0199e882-2000-7000-8000-000000000001", bigId, "duży"),
                        MakeTranslation("0199e882-2000-7000-8000-000000000002", mediumId, "średni"),
                        MakeTranslation("0199e882-2000-7000-8000-000000000003", smallId, "mały")
                    ],
                    Answers =
                    [
                        MakeAnswer(bigId, "big", true, 1),
                        MakeAnswer(bigId, "big", true, 2),
                        MakeAnswer(bigId, "big", true, 3),
                        MakeAnswer(bigId, "big", false, 4),
                        MakeAnswer(bigId, "big", false, 5),
                        MakeAnswer(bigId, "big", false, 6),

                        MakeAnswer(mediumId, "medium", true, 7),
                        MakeAnswer(mediumId, "medium", true, 8),
                        MakeAnswer(mediumId, "medium", false, 9),
                        MakeAnswer(mediumId, "medium", false, 10),

                        MakeAnswer(smallId, "small", true, 11),
                        MakeAnswer(smallId, "small", false, 12)
                    ]
                }
            }
        };
    }

    private static WordEntity MakeWord(Guid wordId, string word)
    {
        return new WordEntity
        {
            WordId = wordId,
            UserId = "test-user-id",
            Word = word,
            WordTypeId = NounTypeId,
            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
        };
    }

    private static TranslationEntity MakeTranslation(string id, Guid wordId, string translation)
    {
        return new TranslationEntity
        {
            TranslationId = Guid.Parse(id),
            WordId = wordId,
            Translation = translation,
            Order = 0
        };
    }

    private static AnswerEntity MakeAnswer(Guid wordId, string word, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e883-0000-7000-8000-{ord:D12}"),
            UserId = "test-user-id",
            ModeType = "open-questions",
            QuestionType = "english-open",
            Question = word,
            GivenAnswer = isCorrect ? word : "wrong",
            ExpectedAnswer = word,
            IsCorrect = isCorrect,
            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero).AddMinutes(ord),
            WordId = wordId
        };
    }
}
