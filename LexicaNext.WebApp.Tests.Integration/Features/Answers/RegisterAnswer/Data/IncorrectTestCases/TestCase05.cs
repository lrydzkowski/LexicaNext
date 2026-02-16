using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// GivenAnswer exceeds max length (501 chars). Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = "What is the meaning of 'test'?",
                GivenAnswer = new string('a', 501),
                ExpectedAnswer = "test"
            }
        };
    }
}
