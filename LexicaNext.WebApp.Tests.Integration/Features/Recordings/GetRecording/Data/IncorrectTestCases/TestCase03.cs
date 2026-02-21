using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.IncorrectTestCases;

// Recording not found: storage returns null, WireMock returns 404. Expected: 404 Not Found.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            Word = "xyznotfound",
            WordType = "noun",
            Data = new BaseTestCaseData
            {
                EnglishDictionaryApi = new EnglishDictionaryApiTestCaseData
                {
                    WordPages = new Dictionary<string, string?>
                    {
                        ["xyznotfound"] = null
                    }
                }
            }
        };
    }
}
