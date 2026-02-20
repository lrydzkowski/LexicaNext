using LexicaNext.Infrastructure.Db.Common.Entities;

namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class DbTestCaseData
{
    public List<WordEntity> Words { get; init; } = [];

    public List<TranslationEntity> Translations { get; init; } = [];

    public List<ExampleSentenceEntity> ExampleSentences { get; init; } = [];

    public List<SetEntity> Sets { get; init; } = [];

    public List<SetWordEntity> SetWords { get; init; } = [];

    public List<RecordingEntity> Recordings { get; init; } = [];

    public List<AnswerEntity> Answers { get; init; } = [];

    public List<UserSetSequenceEntity> UserSetSequences { get; init; } = [];
}
