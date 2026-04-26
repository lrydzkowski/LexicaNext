using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;

// Mode scoping — only open-questions answers contribute. Full/spelling answers are ignored.
internal static class TestCase04
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordId = Guid.Parse("0199e86c-3000-7000-8000-000000000001");

        return new TestCaseData
        {
            TestCaseId = 4,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordId,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Answers =
                    [
                        // Open-questions: 1 correct
                        new AnswerEntity
                        {
                            AnswerId = Guid.Parse("0199e86d-3000-7000-8000-000000000001"),
                            UserId = "test-user-id",
                            ModeType = "open-questions",
                            QuestionType = "english-open",
                            Question = "apple",
                            GivenAnswer = "apple",
                            ExpectedAnswer = "apple",
                            IsCorrect = true,
                            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero),
                            WordId = wordId
                        },
                        // Spelling mode — must be excluded
                        new AnswerEntity
                        {
                            AnswerId = Guid.Parse("0199e86d-3000-7000-8000-000000000002"),
                            UserId = "test-user-id",
                            ModeType = "spelling",
                            QuestionType = "spelling",
                            Question = "apple",
                            GivenAnswer = "apple",
                            ExpectedAnswer = "apple",
                            IsCorrect = false,
                            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 1, 0, TimeSpan.Zero),
                            WordId = wordId
                        },
                        // Full mode — must be excluded
                        new AnswerEntity
                        {
                            AnswerId = Guid.Parse("0199e86d-3000-7000-8000-000000000003"),
                            UserId = "test-user-id",
                            ModeType = "full",
                            QuestionType = "english-open",
                            Question = "apple",
                            GivenAnswer = "apple",
                            ExpectedAnswer = "apple",
                            IsCorrect = false,
                            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 2, 0, TimeSpan.Zero),
                            WordId = wordId
                        }
                    ]
                }
            }
        };
    }
}
