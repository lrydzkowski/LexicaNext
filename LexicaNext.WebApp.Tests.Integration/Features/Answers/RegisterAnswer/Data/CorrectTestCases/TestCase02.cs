using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;

// Open-questions answer without givenAnswer (user skipped) for an existing word. Expected: 204 No Content.
internal static class TestCase02
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002");

        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "open-questions",
                QuestionType = "native-open",
                Question = "jabłko",
                GivenAnswer = null,
                ExpectedAnswer = "apple",
                IsCorrect = false,
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
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
