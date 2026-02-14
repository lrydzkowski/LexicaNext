using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "test",
                WordType = "noun",
                Translations = [new string('a', 201)],
                ExampleSentences = []
            }
        };
    }
}
