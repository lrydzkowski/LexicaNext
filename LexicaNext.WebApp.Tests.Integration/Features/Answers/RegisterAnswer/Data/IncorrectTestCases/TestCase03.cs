using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// Empty expectedAnswer string. Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = "What is the meaning of 'test'?",
                GivenAnswer = "test",
                ExpectedAnswer = ""
            }
        };
    }
}
