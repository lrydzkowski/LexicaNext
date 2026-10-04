using LexicaNext.Core.Features.Words.GenerateWords.Models;

namespace LexicaNext.Core.Features.Words.GenerateWords.Interfaces;

public interface IWordGenerationService
{
    Task<IReadOnlyList<GeneratedWord>> GenerateWordsAsync(
        int count,
        CancellationToken cancellationToken = default
    );
}
