namespace LexicaNext.Core.Features.Translations.GenerateTranslations.Interfaces;

public interface ITranslationGenerationService
{
    Task<IReadOnlyList<string>> GenerateTranslationsAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    );
}
