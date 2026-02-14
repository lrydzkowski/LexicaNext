using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.CorrectTestCases;

// Word with translations and example sentence. Expected: 201 Created.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "bright",
                WordType = "adjective",
                Translations = ["jasny", "świetlany"],
                ExampleSentences = ["The bright sun warmed the garden."]
            }
        };
    }
}
