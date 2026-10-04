namespace LexicaNext.Core.Features.Sentences.GenerateExampleSentences.Interfaces;

public interface IExampleSentenceGenerationService
{
    Task<IReadOnlyList<string>> GenerateExampleSentencesAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    );
}
