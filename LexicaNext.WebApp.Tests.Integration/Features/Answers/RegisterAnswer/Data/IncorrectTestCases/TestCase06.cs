using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// ExpectedAnswer exceeds max length (501 chars). Expected: 400 Bad Request.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = "What is the meaning of 'test'?",
                GivenAnswer = "test",
                ExpectedAnswer = new string('a', 501)
            }
        };
    }
}
