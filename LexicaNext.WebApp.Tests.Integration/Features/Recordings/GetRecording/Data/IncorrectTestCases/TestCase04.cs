using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.IncorrectTestCases;

// Dictionary API failure: storage returns null, WireMock returns 500. Expected: 500 Internal Server Error.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            Word = "servererror",
            WordType = "noun",
            Data = new BaseTestCaseData
            {
                EnglishDictionaryApi = new EnglishDictionaryApiTestCaseData
                {
                    WordPages = new Dictionary<string, string?>
                    {
                        ["servererror"] = null
                    },
                    ShouldFail = true
                }
            }
        };
    }
}
