namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.IncorrectTestCases;

// Word exceeds 100 characters. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            Word = new string('a', 101),
            WordType = "noun"
        };
    }
}
