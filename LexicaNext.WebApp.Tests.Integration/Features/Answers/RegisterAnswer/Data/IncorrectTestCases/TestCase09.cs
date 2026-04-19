using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// ModeType is not one of the allowed values. Expected: 400 Bad Request.
internal static class TestCase09
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 9,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "invalid-mode",
                QuestionType = "english-open",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true
            }
        };
    }
}
