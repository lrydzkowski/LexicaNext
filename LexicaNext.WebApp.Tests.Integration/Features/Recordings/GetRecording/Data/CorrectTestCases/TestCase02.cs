using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.CorrectTestCases;

// Uncached recording: no DB record, WireMock returns HTML page + audio file. Expected: 200 OK, audio/mpeg.
internal static class TestCase02
{
    private static readonly byte[] AudioBytes = [0xFF, 0xFB, 0x90, 0x04, 0x05, 0x06, 0x07, 0x08];

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            Word = "banana",
            WordType = "noun",
            Data = new BaseTestCaseData
            {
                EnglishDictionaryApi = new EnglishDictionaryApiTestCaseData
                {
                    WordPages = new Dictionary<string, string?>
                    {
                        ["banana"] = BuildHtml()
                    },
                    AudioFiles = new Dictionary<string, byte[]?>
                    {
                        ["media/audio/banana.mp3"] = AudioBytes
                    }
                }
            }
        };
    }

    private static string BuildHtml()
    {
        return
            "<div>" +
            "<div><span class=\"headword\"><span>banana</span></span></div>" +
            "<div><span>noun</span></div>" +
            "<span class=\"us\"><source type=\"audio/mpeg\" src=\"/media/audio/banana.mp3\"></span>" +
            "</div>";
    }
}
