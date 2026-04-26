using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;

// Sort by correctCount asc (explicit). Uses the same seed as TestCase02.
// Expected order: run (1 correct), bright (2 correct), apple (3 correct).
internal static class TestCase05
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");
    private static readonly Guid AdjectiveTypeId = Guid.Parse("0196294e-9a78-7573-9db1-47b3d0ee9eae");

    public static TestCaseData Get()
    {
        Guid appleId = Guid.Parse("0199e86c-5000-7000-8000-000000000001");
        Guid brightId = Guid.Parse("0199e86c-5000-7000-8000-000000000002");
        Guid runId = Guid.Parse("0199e86c-5000-7000-8000-000000000003");

        return new TestCaseData
        {
            TestCaseId = 5,
            SortingFieldName = "correctCount",
            SortingOrder = "asc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = appleId,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = brightId,
                            UserId = "test-user-id",
                            Word = "bright",
                            WordTypeId = AdjectiveTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 2, 0, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = runId,
                            UserId = "test-user-id",
                            Word = "run",
                            WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 3, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Answers =
                    [
                        MakeAnswer(appleId, "apple", true, 1),
                        MakeAnswer(appleId, "apple", true, 2),
                        MakeAnswer(appleId, "apple", true, 3),
                        MakeAnswer(brightId, "bright", true, 4),
                        MakeAnswer(brightId, "bright", true, 5),
                        MakeAnswer(runId, "run", true, 6)
                    ]
                }
            }
        };
    }

    private static AnswerEntity MakeAnswer(Guid wordId, string word, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e86d-5000-7000-8000-{ord:D12}"),
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
