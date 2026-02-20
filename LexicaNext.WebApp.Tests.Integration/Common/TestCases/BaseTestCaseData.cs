namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class BaseTestCaseData
{
    public DbTestCaseData Db { get; init; } = new();

    public EnglishDictionaryApiTestCaseData EnglishDictionaryApi { get; init; } = new();

    public AiServiceTestCaseData AiService { get; init; } = new();

    public RecordingStorageTestCaseData RecordingStorage { get; init; } = new();

    public LoggingTestCaseData Logging { get; init; } = new();
}
