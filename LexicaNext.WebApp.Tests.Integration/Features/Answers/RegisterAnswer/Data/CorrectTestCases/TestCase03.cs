using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;

// Sentences mode answer with sentence-fill question type, correct answer. Expected: 204 No Content.
internal static class TestCase03
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordId = Guid.Parse("0199e86c-0003-7000-8000-000000000003");

        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "sentences",
                QuestionType = "sentence-fill",
                Question = "The cat sat on the _____.",
                GivenAnswer = "mat",
                ExpectedAnswer = "mat",
                IsCorrect = true,
                WordId = wordId
            },
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
                            Word = "mat",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
