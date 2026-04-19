using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// IsCorrect is missing (null). Expected: 400 Bad Request.
internal static class TestCase10
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 10,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = null
            }
        };
    }
}
