namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.IncorrectTestCases;

// Empty word (after sanitization). Expected: 400 Bad Request.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Word = "$$$",
            WordType = "noun"
        };
    }
}
