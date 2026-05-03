using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// Cross-user isolation — current user has 1 answered word; other user has 3 answered words. Expected: only the 1 current-user word.
internal static class TestCase05
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid myWordId = Guid.Parse("0199e886-1000-7000-8000-000000000001");
        Guid otherWordA = Guid.Parse("0199e886-1000-7000-8000-000000000002");
        Guid otherWordB = Guid.Parse("0199e886-1000-7000-8000-000000000003");
        Guid otherWordC = Guid.Parse("0199e886-1000-7000-8000-000000000004");

        return new TestCaseData
        {
            TestCaseId = 5,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(myWordId, "test-user-id", "mine"),
                        MakeWord(otherWordA, "other-user-id", "alpha"),
                        MakeWord(otherWordB, "other-user-id", "bravo"),
                        MakeWord(otherWordC, "other-user-id", "charlie")
                    ],
                    Translations =
                    [
                        MakeTranslation("0199e886-2000-7000-8000-000000000001", myWordId, "moje")
                    ],
                    Answers =
                    [
                        MakeAnswer(myWordId, "mine", "test-user-id", false, 1),
                        MakeAnswer(otherWordA, "alpha", "other-user-id", false, 2),
                        MakeAnswer(otherWordB, "bravo", "other-user-id", false, 3),
                        MakeAnswer(otherWordC, "charlie", "other-user-id", false, 4)
                    ]
                }
            }
        };
    }

    private static WordEntity MakeWord(Guid wordId, string userId, string word)
    {
        return new WordEntity
        {
            WordId = wordId,
            UserId = userId,
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

    private static AnswerEntity MakeAnswer(Guid wordId, string word, string userId, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e887-0000-7000-8000-{ord:D12}"),
            UserId = userId,
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
