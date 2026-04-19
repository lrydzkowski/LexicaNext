using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// ModeType exceeds max length (51 chars). Expected: 400 Bad Request.
internal static class TestCase08
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 8,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = new string('a', 51),
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true
            }
        };
    }
}
