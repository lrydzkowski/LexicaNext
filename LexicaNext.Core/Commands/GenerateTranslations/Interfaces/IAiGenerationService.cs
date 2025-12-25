namespace LexicaNext.Core.Commands.GenerateTranslations.Interfaces;

public interface IAiGenerationService
{
    Task<IReadOnlyList<string>> GenerateTranslationsAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<string>> GenerateExampleSentencesAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    );
}
