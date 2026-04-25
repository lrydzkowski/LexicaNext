using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// WordId is Guid.Empty. Expected: 400 Bad Request.
internal static class TestCase14
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 14,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "english-open",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true,
                WordId = Guid.Empty
            }
        };
    }
}
